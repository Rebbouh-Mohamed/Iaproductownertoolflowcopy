from django.test import TestCase
from rest_framework.test import APITestCase, APIRequestFactory
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import CustomUser
from .serializers import UserSerializer, RegisterSerializer
from .views import RegisterView, LoginView

User = CustomUser

class CustomUserModelTest(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.username, 'testuser')
        self.assertTrue(user.check_password('testpass123'))
        self.assertFalse(user.is_superuser)
        self.assertFalse(user.is_staff)

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            email='admin@example.com',
            username='admin',
            password='adminpass123'
        )
        self.assertEqual(admin.email, 'admin@example.com')
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_staff)

    def test_user_str(self):
        user = User.objects.create_user(email='strtest@example.com', username='struser', password='pass')
        self.assertEqual(str(user), 'strtest@example.com')

    def test_email_unique(self):
        User.objects.create_user(email='unique@example.com', username='user1', password='pass')
        with self.assertRaises(ValueError):  # Or IntegrityError in DB test
            User.objects.create_user(email='unique@example.com', username='user2', password='pass')

class UserSerializerTest(TestCase):
    def test_user_serializer(self):
        user = User.objects.create_user(email='serial@example.com', username='serialuser', password='pass')
        serializer = UserSerializer(user)
        data = serializer.data
        self.assertEqual(data['email'], 'serial@example.com')
        self.assertEqual(data['username'], 'serialuser')
        self.assertNotIn('password', data)  # Password shouldn't be serialized

class RegisterSerializerTest(TestCase):
    def test_register_serializer_valid(self):
        data = {
            'email': 'register@example.com',
            'username': 'reguser',
            'password': 'regpass123'
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.email, 'register@example.com')
        self.assertTrue(user.check_password('regpass123'))

    def test_register_serializer_invalid_email(self):
        data = {
            'email': 'invalidemail',  # Bad format
            'username': 'invuser',
            'password': 'invpass123'
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_register_serializer_missing_fields(self):
        data = {'email': 'missing@example.com'}  # Missing username/password
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)
        self.assertIn('password', serializer.errors)

class RegisterViewTest(APITestCase):
    def test_register_success(self):
        url = '/api/auth/register/'  # Adjust if your URL is different
        data = {
            'email': 'viewreg@example.com',
            'username': 'viewreguser',
            'password': 'viewregpass123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['email'], 'viewreg@example.com')

    def test_register_duplicate_email(self):
        User.objects.create_user(email='dup@example.com', username='dupuser', password='pass')
        url = '/api/auth/register/'
        data = {
            'email': 'dup@example.com',
            'username': 'newuser',
            'password': 'newpass123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)  # Error for unique constraint

class LoginViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='login@example.com',
            username='loginuser',
            password='loginpass123'
        )

    def test_login_success(self):
        url = '/api/auth/login/'
        data = {
            'email': 'login@example.com',
            'password': 'loginpass123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'login@example.com')

    def test_login_invalid_credentials(self):
        url = '/api/auth/login/'
        data = {
            'email': 'login@example.com',
            'password': 'wrongpass'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_login_missing_fields(self):
        url = '/api/auth/login/'
        data = {'email': 'missing@example.com'}  # No password
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)  # Or 400, depending on validation