import { UsersRepository } from './users.repository.js'
import { UserOauthProvidersRepository } from '../user_oauth_providers/user_oauth_providers.repository.js'
import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js'
import { OAuth2Client } from 'google-auth-library'

const repo = new UsersRepository()
const oauthRepo = new UserOauthProvidersRepository()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export class UsersService {
  async getAll(query) {
    return repo.findAll(query)
  }

  async getById(id) {
    const item = await repo.findById(id)
    if (!item) {
      const err = new Error('Không tìm thấy users')
      err.status = 404
      throw err
    }
    return item
  }

  async create(data) {
    if (data.password_hash) {
      data.password_hash = await bcrypt.hash(data.password_hash, 10)
    }
    return repo.create(data)
  }

  async update(id, data) {
    await this.getById(id) // throws 404 if not found
    if (data.password_hash) {
      data.password_hash = await bcrypt.hash(data.password_hash, 10)
    }
    return repo.update(id, data)
  }

  async delete(id) {
    await this.getById(id)
    return repo.delete(id)
  }

  async login(email, password) {
    const user = await repo.findByEmail(email)
    if (!user) {
      const err = new Error('Email hoặc mật khẩu không đúng')
      err.status = 401
      throw err
    }
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      const err = new Error('Email hoặc mật khẩu không đúng')
      err.status = 401
      throw err
    }
    const payload = { id: user.id, email: user.email, role: user.role }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)
    const { password_hash: _, ...userWithoutPassword } = user.toJSON()
    return { user: userWithoutPassword, accessToken, refreshToken }
  }

  async refresh(refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken)
      const user = await repo.findById(decoded.id)
      if (!user) throw new Error('User không tồn tại')
      const payload = { id: user.id, email: user.email, role: user.role }
      return { accessToken: generateAccessToken(payload) }
    } catch {
      const err = new Error('Refresh token không hợp lệ hoặc đã hết hạn')
      err.status = 401
      throw err
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await repo.findById(userId)
    if (!user) {
      const err = new Error('User không tồn tại')
      err.status = 404
      throw err
    }
    if (user.password_hash) {
      const isMatch = await bcrypt.compare(oldPassword, user.password_hash)
      if (!isMatch) {
        const err = new Error('Mật khẩu cũ không chính xác')
        err.status = 400
        throw err
      }
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10)
    await repo.update(userId, { password_hash: newPasswordHash })
    return { success: true }
  }

  async register(data) {
    const existingUser = await repo.findByEmail(data.email)
    if (existingUser) {
      const err = new Error('Email đã được sử dụng')
      err.status = 409
      throw err
    }
    const password_hash = await bcrypt.hash(data.password, 10)
    const randomSeed = Math.random().toString(36).substring(7)
    const avatar_url = `https://api.dicebear.com/7.x/avataaars/png?seed=${randomSeed}`
    
    const newUser = await repo.create({
      ...data,
      password_hash,
      avatar_url,
      role: 'customer',
      is_active: true
    })
    
    const payload = { id: newUser.id, email: newUser.email, role: newUser.role }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)
    const { password_hash: _, ...userWithoutPassword } = newUser.toJSON()
    return { user: userWithoutPassword, accessToken, refreshToken }
  }

  async loginWithGoogle(idToken) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      })
      const payload = ticket.getPayload()
      const { sub: googleId, email, name, picture } = payload

      // Check if OAuth record exists
      let oauthRecord = await oauthRepo.findByProvider('google', googleId)
      let user

      if (oauthRecord) {
        user = await repo.findById(oauthRecord.user_id)
      } else {
        // Check if user with same email exists
        user = await repo.findByEmail(email)
        if (!user) {
          // Create new user
          user = await repo.create({
            email,
            full_name: name,
            avatar_url: picture,
            role: 'customer',
            is_active: true,
            is_verified: true
          })
        }
        // Link oauth provider
        await oauthRepo.create({
          user_id: user.id,
          provider: 'google',
          provider_uid: googleId
        })
      }

      // Generate JWT
      const tokenPayload = { id: user.id, email: user.email, role: user.role }
      const accessToken = generateAccessToken(tokenPayload)
      const refreshToken = generateRefreshToken(tokenPayload)
      
      const { password_hash: _, ...userWithoutPassword } = user.toJSON ? user.toJSON() : user
      return { user: userWithoutPassword, accessToken, refreshToken }
    } catch (err) {
      console.error('Google Auth Error:', err)
      const error = new Error('Xác thực Google thất bại')
      error.status = 401
      throw error
    }
  }
}
