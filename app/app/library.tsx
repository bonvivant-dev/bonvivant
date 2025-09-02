import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'

import { useAuth } from '../feature/auth/components/AuthContext'

export default function Library() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      Alert.alert('로그인 실패', error as string)
    }
  }

  // TODO : 안드로이드에서 안됨
  const handleSignOut = async () => {
    try {
      await signOut()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert('로그아웃 실패', '로그아웃 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 서재</Text>

      {user ? (
        // 로그인된 사용자 UI
        <View style={styles.userSection}>
          <Text style={styles.welcomeText}>안녕하세요!</Text>
          <Text style={styles.emailText}>{user.email}</Text>

          <View style={styles.librarySection}>
            <Text style={styles.libraryTitle}>내 서재 목록</Text>
            <Text style={styles.emptyText}>아직 구독한 매거진이 없습니다.</Text>
          </View>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // 로그인하지 않은 사용자 UI
        <View style={styles.loginSection}>
          <Text style={styles.loginMessage}>
            내 서재를 이용하려면 로그인이 필요합니다
          </Text>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
          >
            <Text style={styles.googleButtonText}>구글로 로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.emailButton}>
            <Text style={styles.emailButtonText}>다른 이메일로 로그인</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  userSection: {
    alignItems: 'center',
    width: '100%',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  librarySection: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  libraryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginSection: {
    alignItems: 'center',
    width: '100%',
  },
  loginMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
  },
  googleButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emailButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    width: '80%',
  },
  emailButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
})
