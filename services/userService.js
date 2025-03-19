import { API_BASE_URL } from '../config'

export default {
  async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`)
      if (!response.ok) throw new Error('Error fetching users')
      return await response.json()
    } catch (error) {
      console.error('Error in userService.getUsers:', error)
      throw error
    }
  },

  async getUserById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Users/${id}`)
      if (!response.ok) throw new Error('Error fetching user')
      const data = await response.json()
      console.log('User data:', data) // Depuración
      return data
    } catch (error) {
      console.error('Error in userService.getUserById:', error)
      throw error
    }
  },
  
  async createUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      if (!response.ok) throw new Error('Error creating user')
      return await response.json()
    } catch (error) {
      console.error('Error in userService.createUser:', error)
      throw error
    }
  },

  async updateUser(id, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      if (!response.ok) throw new Error('Error updating user')
      return await response.json()
    } catch (error) {
      console.error('Error in userService.updateUser:', error)
      throw error
    }
  },

  async deleteUser(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Users/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Error deleting user')
      return true
    } catch (error) {
      console.error('Error in userService.deleteUser:', error)
      throw error
    }
  },
}