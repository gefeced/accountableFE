import requests
import sys
import json
from datetime import datetime

class AccountableAPITester:
    def __init__(self, base_url="https://chore-quest-10.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_email = f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com"
        self.test_user_password = "TestPassword123!"
        self.test_username = f"testuser_{datetime.now().strftime('%H%M%S')}"

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)
            
            print(f"Status Code: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.content:
                    try:
                        response_data = response.json()
                        print(f"Response data keys: {list(response_data.keys()) if isinstance(response_data, dict) else type(response_data)}")
                        return True, response_data
                    except:
                        return True, response.text
                return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"Error: {error_data}")
                except:
                    print(f"Error text: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": self.test_user_email,
                "password": self.test_user_password,
                "username": self.test_username
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response['user']
            print(f"Registered user: {self.user_data.get('username')} with ID: {self.user_data.get('id')}")
            return True
        return False

    def test_user_login(self):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": self.test_user_email,
                "password": self.test_user_password
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response['user']
            return True
        return False

    def test_get_profile(self):
        """Test getting user profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "user/profile",
            200
        )
        if success:
            expected_fields = ['id', 'email', 'username', 'accountable_xp', 'accountable_level', 'coins', 'streak']
            missing_fields = [field for field in expected_fields if field not in response]
            if missing_fields:
                print(f"Warning: Missing fields in profile: {missing_fields}")
            return True
        return False

    def test_update_theme(self):
        """Test theme update"""
        success, response = self.run_test(
            "Update Theme",
            "PATCH",
            "user/theme",
            200,
            data={"theme": "clean"}
        )
        return success

    def test_create_chore(self):
        """Test creating a chore"""
        success, response = self.run_test(
            "Create Chore",
            "POST",
            "chores",
            200,
            data={
                "title": "Test Kitchen Cleaning",
                "description": "Cleaned all dishes and counters",
                "duration": 1800  # 30 minutes
            }
        )
        if success:
            expected_fields = ['id', 'title', 'xp_earned', 'coins_earned', 'chore_xp_earned', 'chore_coins_earned']
            missing_fields = [field for field in expected_fields if field not in response]
            if missing_fields:
                print(f"Warning: Missing fields in chore response: {missing_fields}")
            return response.get('id')
        return None

    def test_get_chores(self):
        """Test getting user's chores"""
        success, response = self.run_test(
            "Get Chores",
            "GET",
            "chores",
            200
        )
        if success and isinstance(response, list):
            print(f"Found {len(response)} chores")
            return True
        return False

    def test_get_shop_items(self):
        """Test getting shop items"""
        success, response = self.run_test(
            "Get Shop Items",
            "GET",
            "shop/items",
            200
        )
        if success and isinstance(response, list):
            print(f"Found {len(response)} shop items")
            if len(response) > 0:
                item = response[0]
                expected_fields = ['id', 'name', 'type', 'cost', 'description']
                missing_fields = [field for field in expected_fields if field not in item]
                if missing_fields:
                    print(f"Warning: Missing fields in shop item: {missing_fields}")
            return response[0]['id'] if response else None
        return None

    def test_purchase_item(self, item_id):
        """Test purchasing a shop item"""
        # First get current user to check coins
        profile_success, profile_data = self.run_test(
            "Get Profile for Purchase Check",
            "GET",
            "user/profile",
            200
        )
        
        if not profile_success:
            print("Failed to get profile for purchase check")
            return False
            
        current_coins = profile_data.get('chore_coins', 0)
        print(f"Current chore coins: {current_coins}")
        
        # If user doesn't have enough coins, create more chores first
        if current_coins < 50:  # Assuming basic items cost around 30-50
            print("Not enough coins, creating more chores first...")
            for i in range(3):
                self.test_create_chore()
        
        success, response = self.run_test(
            "Purchase Shop Item",
            "POST",
            "shop/purchase",
            200,
            data={"item_id": item_id}
        )
        return success

    def test_create_group(self):
        """Test creating a group"""
        success, response = self.run_test(
            "Create Group",
            "POST",
            "groups/create",
            200,
            data={"name": f"Test Family {datetime.now().strftime('%H%M%S')}"}
        )
        if success:
            expected_fields = ['id', 'name', 'code', 'created_by', 'members']
            missing_fields = [field for field in expected_fields if field not in response]
            if missing_fields:
                print(f"Warning: Missing fields in group: {missing_fields}")
            return response.get('code')
        return None

    def test_join_group(self, group_code):
        """Test joining a group"""
        success, response = self.run_test(
            "Join Group",
            "POST",
            "groups/join",
            200,
            data={"code": group_code}
        )
        return success

    def test_get_my_group(self):
        """Test getting user's group"""
        success, response = self.run_test(
            "Get My Group",
            "GET",
            "groups/my-group",
            200
        )
        return success

    def test_get_leaderboard(self, period="daily"):
        """Test getting leaderboard"""
        success, response = self.run_test(
            f"Get Leaderboard ({period})",
            "GET",
            f"leaderboard/{period}",
            200
        )
        if success and isinstance(response, list):
            print(f"Found {len(response)} leaderboard entries")
            return True
        return False

def main():
    print("🚀 Starting Accountable API Tests...")
    tester = AccountableAPITester()
    
    # Test Authentication Flow
    print("\n" + "="*50)
    print("AUTHENTICATION TESTS")
    print("="*50)
    
    if not tester.test_user_registration():
        print("❌ Registration failed, stopping tests")
        return 1
    
    if not tester.test_user_login():
        print("❌ Login failed, stopping tests")
        return 1
    
    if not tester.test_get_profile():
        print("❌ Get profile failed")
    
    tester.test_update_theme()
    
    # Test Chores System
    print("\n" + "="*50)
    print("CHORES SYSTEM TESTS")
    print("="*50)
    
    chore_id = tester.test_create_chore()
    if not chore_id:
        print("❌ Chore creation failed")
    
    if not tester.test_get_chores():
        print("❌ Get chores failed")
    
    # Test Shop System
    print("\n" + "="*50)
    print("SHOP SYSTEM TESTS")
    print("="*50)
    
    item_id = tester.test_get_shop_items()
    if item_id:
        tester.test_purchase_item(item_id)
    else:
        print("❌ No shop items found")
    
    # Test Groups & Leaderboard
    print("\n" + "="*50)
    print("GROUPS & LEADERBOARD TESTS")
    print("="*50)
    
    group_code = tester.test_create_group()
    if group_code:
        # Create second user to test joining
        tester.test_join_group(group_code)  # Will fail as same user, but tests endpoint
    
    tester.test_get_my_group()
    
    # Test leaderboard for different periods
    for period in ['daily', 'weekly', 'monthly', 'lifetime']:
        tester.test_get_leaderboard(period)
    
    # Print final results
    print("\n" + "="*50)
    print("TEST RESULTS SUMMARY")
    print("="*50)
    print(f"📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("✅ Backend API tests mostly successful!")
        return 0
    else:
        print("❌ Multiple backend API failures detected")
        return 1

if __name__ == "__main__":
    sys.exit(main())