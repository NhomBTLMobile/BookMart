import React, { useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import SearchBar from '@/components/home/SearchBar';
import BannerCard from '@/components/home/BannerCard';
import CategoryCard from '@/components/home/CategoryCard';
import BookCard from '@/components/home/BookCard';
import SectionHeader from '@/components/common/SectionHeader';

import { COLORS } from '@/constants/colors';

export default function HomeScreen() {

  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* HEADER */}
        <View style={styles.header}>

          <View>
            <Text style={styles.hello}>
              Xin chào,
            </Text>

            <Text style={styles.name}>
              Thanh Đào 👋
            </Text>
          </View>

          <View style={styles.notification}>
            <Ionicons
              name="notifications-outline"
              size={25}
              color={COLORS.text}
            />

            <View style={styles.notificationDot} />
          </View>

        </View>


        {/* SEARCH */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
        />


        {/* BANNER */}
        <View style={styles.bannerSection}>
          <BannerCard
            onPress={() => {
              console.log('Mua ngay');
            }}
          />
        </View>

        {/* RECENTLY VIEWED (Zeigarnik Effect) */}
        <View style={styles.section}>
          <SectionHeader
            title="Sản phẩm xem gần đây"
            onPress={() => console.log('Xem tất cả')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BookCard
              image={require('../../assets/images/book3.jpg')}
              title="Tôi thấy hoa vàng trên cỏ xanh"
              author="Nguyễn Nhật Ánh"
              price="65.000đ"
              rating={4.7}
              onPress={() => router.push('/book/3')}
              onAddToCart={() => console.log('Add book 3')}
            />
            <BookCard
              image={require('../../assets/images/book1.jpg')}
              title="Đắc Nhân Tâm"
              author="Dale Carnegie"
              price="89.000đ"
              rating={4.8}
              onPress={() => router.push('/book/1')}
              onAddToCart={() => console.log('Add book 1')}
            />
          </ScrollView>
        </View>


        {/* CATEGORY */}
        <SectionHeader
          title="Danh mục"
          onPress={() => {
            console.log('Xem tất cả danh mục');
          }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >

          <CategoryCard
            icon="book-outline"
            title="Văn học"
          />

          <CategoryCard
            icon="trending-up-outline"
            title="Kinh tế"
          />

          <CategoryCard
            icon="bulb-outline"
            title="Kỹ năng sống"
          />

          <CategoryCard
            icon="happy-outline"
            title="Thiếu nhi"
          />

          <CategoryCard
            icon="school-outline"
            title="Sách học tập"
          />

        </ScrollView>

        {/* FLASH SALE (FOMO / Scarcity) */}
        <View style={styles.section}>
          <SectionHeader
            title="🔥 Giá sốc hôm nay"
            onPress={() => console.log('Xem tất cả')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BookCard
              image={require('../../assets/images/book2.jpg')}
              title="Nhà Giả Kim"
              author="Paulo Coelho"
              price="55.000đ"
              rating={4.9}
              discount="-25%"
              onPress={() => router.push('/book/2')}
              onAddToCart={() => console.log('Add book 2')}
            />
            <BookCard
              image={require('../../assets/images/book4.jpg')}
              title="Tuổi trẻ đáng giá bao nhiêu"
              author="Rosie Nguyễn"
              price="49.000đ"
              rating={4.8}
              discount="-38%"
              onPress={() => router.push('/book/4')}
              onAddToCart={() => console.log('Add book 4')}
            />
            <BookCard
              image={require('../../assets/images/book1.jpg')}
              title="Đắc Nhân Tâm"
              author="Dale Carnegie"
              price="70.000đ"
              rating={4.8}
              discount="-21%"
              onPress={() => router.push('/book/1')}
              onAddToCart={() => console.log('Add book 1')}
            />
          </ScrollView>
        </View>


        {/* BOOKS */}
        <View style={styles.section}>
          <SectionHeader
            title="Sách nổi bật"
            onPress={() => {
              console.log('Xem thêm sách');
            }}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >

            <BookCard
              image={require(
                '../../assets/images/book1.jpg'
              )}
              title="Đắc Nhân Tâm"
              author="Dale Carnegie"
              price="89.000đ"
              rating={4.8}
              onPress={() => {
                router.push('/book/1');
              }}
              onAddToCart={() => {
                console.log('Add book 1');
              }}
            />

            <BookCard
              image={require(
                '../../assets/images/book2.jpg'
              )}
              title="Nhà Giả Kim"
              author="Paulo Coelho"
              price="75.000đ"
              rating={4.9}
              onPress={() => {
                router.push('/book/2');
              }}
              onAddToCart={() => {
                console.log('Add book 2');
              }}
            />

            <BookCard
              image={require(
                '../../assets/images/book3.jpg'
              )}
              title="Tôi thấy hoa vàng trên cỏ xanh"
              author="Nguyễn Nhật Ánh"
              price="65.000đ"
              rating={4.7}
              onPress={() => {
                router.push('/book/3');
              }}
              onAddToCart={() => {
                console.log('Add book 3');
              }}
            />

            <BookCard
              image={require(
                '../../assets/images/book4.jpg'
              )}
              title="Tuổi trẻ đáng giá bao nhiêu"
              author="Rosie Nguyễn"
              price="79.000đ"
              rating={4.8}
              onPress={() => {
                router.push('/book/4');
              }}
              onAddToCart={() => {
                console.log('Add book 4');
              }}
            />

          </ScrollView>
        </View>

        {/* RECOMMENDED (Cocktail Party Effect) */}
        <View style={styles.section}>
          <SectionHeader
            title="Dành riêng cho Thanh Đào"
            onPress={() => console.log('Xem thêm')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BookCard
              image={require('../../assets/images/book4.jpg')}
              title="Tuổi trẻ đáng giá bao nhiêu"
              author="Rosie Nguyễn"
              price="79.000đ"
              rating={4.8}
              onPress={() => router.push('/book/4')}
              onAddToCart={() => console.log('Add book 4')}
            />
            <BookCard
              image={require('../../assets/images/book3.jpg')}
              title="Tôi thấy hoa vàng trên cỏ xanh"
              author="Nguyễn Nhật Ánh"
              price="65.000đ"
              rating={4.7}
              onPress={() => router.push('/book/3')}
              onAddToCart={() => console.log('Add book 3')}
            />
          </ScrollView>
        </View>


        {/* FREE SHIPPING */}
        <View style={styles.shippingCard}>

          <View style={styles.shippingIcon}>
            <Ionicons
              name="car-outline"
              size={24}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.shippingText}>
            <Text style={styles.shippingTitle}>
              Miễn phí vận chuyển
            </Text>

            <Text style={styles.shippingSubtitle}>
              Cho đơn hàng từ 200.000đ
            </Text>
          </View>

        </View>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,

    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 20,

    paddingTop: 55,

    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 18,
  },

  hello: {
    fontSize: 14,

    color: COLORS.textSecondary,
  },

  name: {
    fontSize: 23,

    fontWeight: '800',

    color: COLORS.text,

    marginTop: 2,
  },

  notification: {
    width: 45,
    height: 45,

    borderRadius: 23,

    backgroundColor: COLORS.surface,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,

    borderColor: COLORS.border,
  },

  notificationDot: {
    position: 'absolute',

    top: 9,
    right: 10,

    width: 8,
    height: 8,

    borderRadius: 4,

    backgroundColor: '#E53935',
  },

  bannerSection: {
    marginTop: 18,
  },

  horizontalScroll: {
    marginBottom: 12,
  },

  section: {
    marginTop: 12,
  },

  shippingCard: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: COLORS.primaryLight,

    borderRadius: 16,

    padding: 15,

    marginTop: 22,
  },

  shippingIcon: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: COLORS.white,

    alignItems: 'center',
    justifyContent: 'center',
  },

  shippingText: {
    marginLeft: 12,
  },

  shippingTitle: {
    fontSize: 15,

    fontWeight: '700',

    color: COLORS.text,
  },

  shippingSubtitle: {
    fontSize: 12,

    color: COLORS.textSecondary,

    marginTop: 3,
  },

}); 