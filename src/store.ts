import { createStore } from 'vuex'
import User from '@/models/User'

export default createStore({
  state() {
    return {
      currentUser: new User(),
      isLogged: false,
    }
  },
  mutations: {
    setUser(state, user: User) {
      state.currentUser = user
    },
    setLogged(state, isLogged: boolean) {
      state.isLogged = isLogged
    },
    logout(state) {
      state.isLogged = false
      state.currentUser = new User()
    }
  }
})
