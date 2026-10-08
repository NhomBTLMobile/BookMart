import natural from 'natural'
import Books from '../books/books.model.js'
import BookFeatureVectors from '../book_feature_vectors/book_feature_vectors.model.js'

export class RecommendationsService {
  /**
   * Tính toán độ tương đồng Cosine giữa 2 vector
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB) return 0;
    const intersection = Object.keys(vecA).filter(k => vecB.hasOwnProperty(k));
    let dotProduct = 0;
    intersection.forEach(k => { dotProduct += vecA[k] * vecB[k]; });
    
    const magnitudeA = Math.sqrt(Object.values(vecA).reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(Object.values(vecB).reduce((sum, val) => sum + val * val, 0));
    
    if (magnitudeA && magnitudeB) {
      return dotProduct / (magnitudeA * magnitudeB);
    }
    return 0;
  }

  /**
   * Khởi tạo và cập nhật Feature Vectors cho toàn bộ sách
   */
  async generateAllVectors() {
    const books = await Books.findAll({
      include: ['categories', 'authors'],
      where: { is_active: true }
    });

    const tfidf = new natural.TfIdf();
    
    // Add documents for TF-IDF (sử dụng tokenizer đơn giản)
    books.forEach(book => {
      const content = `${book.title || ''} ${book.description || ''}`;
      tfidf.addDocument(content);
    });

    const vectorsToSave = [];
    
    books.forEach((book, index) => {
      // 1. Category vector (One-hot encoding) - Trọng số cao (10)
      const category_vector = {};
      book.categories?.forEach(c => { category_vector[`cat_${c.id}`] = 10 });

      // 2. Author vector (One-hot encoding) - Trọng số cao (10)
      const author_vector = {};
      book.authors?.forEach(a => { author_vector[`auth_${a.id}`] = 10 });

      // 3. Format vector
      const format_vector = {};
      if (book.format) format_vector[`format_${book.format}`] = 2;

      // 4. TF-IDF vector cho nội dung văn bản - Trọng số thấp hơn
      const text_vector = {};
      const terms = tfidf.listTerms(index);
      // Lấy top 50 từ khóa quan trọng nhất để vector không quá lớn
      terms.slice(0, 50).forEach(item => {
        text_vector[item.term] = item.tfidf;
      });

      // Kết hợp tất cả các đặc trưng thành 1 vector duy nhất
      const combined_vector = { ...category_vector, ...author_vector, ...text_vector };
      
      vectorsToSave.push({
        book_id: book.id,
        category_vector,
        author_vector,
        format_vector,
        combined_vector,
        updated_at: new Date()
      });
    });

    // Bulk upsert vào database
    if (vectorsToSave.length > 0) {
      await BookFeatureVectors.bulkCreate(vectorsToSave, {
        updateOnDuplicate: ['category_vector', 'author_vector', 'format_vector', 'combined_vector', 'updated_at']
      });
    }

    return { message: `Đã tạo feature vectors thành công cho ${vectorsToSave.length} cuốn sách.` };
  }

  /**
   * Lấy sách tương tự (Content-based Filtering)
   */
  async getSimilarBooks(bookId, limit = 10) {
    // 1. Kiểm tra xem sách có vector chưa
    let targetVector = await BookFeatureVectors.findByPk(bookId);
    
    // 2. Tạm thời force generate lại vector (có thể xóa sau khi đã chạy 1 lần)
    await this.generateAllVectors();
    targetVector = await BookFeatureVectors.findByPk(bookId);
    
    if (!targetVector) return []; // Sách không tồn tại

    // 3. Lấy tất cả vectors để so sánh
    const allVectors = await BookFeatureVectors.findAll();
    
    const similarities = [];
    allVectors.forEach(v => {
      if (v.book_id === bookId) return; // Bỏ qua chính nó
      
      // Tính Cosine Similarity
      const score = this.cosineSimilarity(
        targetVector.combined_vector, 
        v.combined_vector
      );
      
      if (score > 0.05) { // Chỉ lấy những sách có sự tương đồng nhất định
        similarities.push({ book_id: v.book_id, score });
      }
    });

    // 4. Sắp xếp giảm dần theo điểm tương đồng, nếu điểm bằng nhau thì random nhẹ để không bị nhàm chán
    similarities.sort((a, b) => {
      const diff = b.score - a.score;
      if (Math.abs(diff) < 0.01) return Math.random() - 0.5;
      return diff;
    });
    
    const topK = similarities.slice(0, limit);
    
    if (topK.length === 0) return [];

    // 5. Lấy chi tiết sách cho topK
    const topBookIds = topK.map(item => item.book_id);
    const books = await Books.findAll({
      where: { id: topBookIds },
      include: ['images', 'authors', 'categories']
    });

    // 6. Map kết quả và giữ đúng thứ tự điểm số
    const result = topK.map(item => {
      const b = books.find(book => book.id === item.book_id);
      if (b) {
        return { ...b.toJSON(), match_score: item.score };
      }
      return null;
    }).filter(Boolean);

    return result;
  }
}
