import requests
import json

# Update these URLs to match your Django server address
BASE_URL = "http://127.0.0.1:8000/api/auth"  # Authentication endpoints
PROJECTS_URL = "http://127.0.0.1:8000/api/projects"  # Project endpoints

def test_login():
    """Test user login"""
    print("\nTesting Login...")
    
    login_data = {
        "email": "testuser@example.com",  # Use email as login field
        "password": "testpassword123"
    }
    
    response = requests.post(f"{BASE_URL}/login/", json=login_data)
    print(f"Login Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Login successful!")
        response_data = response.json()
        print(f"Response: {response_data}")
        return response_data.get('access')  # JWT returns 'access' token
    else:
        print(f"Login failed: {response.text}")
        return None

def test_create_project(auth_token):
    """Test creating a project for features"""
    print("\nTesting Project Creation for Features...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json'
    }
    
    project_data = {
        "name": "Test Features Project",
        "description": "This project will be used to test features functionality",
        "project_type_id": 1,
        "status": "en_cours",
        "start_date": "2025-01-15",
        "end_date": "2025-12-31"
    }
    
    response = requests.post(f"{PROJECTS_URL}/", json=project_data, headers=headers)
    print(f"Create Project Status Code: {response.status_code}")
    
    if response.status_code == 201:
        print("Project created successfully!")
        response_data = response.json()
        print(f"Response: {response_data}")
        return response_data.get('id')
    else:
        print(f"Project creation failed: {response.text}")
        return None

def test_product_vision(auth_token, project_id):
    """Test Product Vision functionality"""
    print(f"\nTesting Product Vision for Project ID: {project_id}...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json'
    }
    
    # First, get the current vision (should create it if doesn't exist)
    response = requests.get(f"{PROJECTS_URL}/{project_id}/vision/", headers=headers)
    print(f"Get Vision Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Vision retrieved successfully!")
        vision_data = response.json()
        print(f"Initial Vision Data: {vision_data}")
        
        # Now update with sample questions
        vision_update_data = {
            "questions_answers": {
                "Quel problème ce produit résout-il ?": "Ce produit résout le problème de la gestion inefficace des projets.",
                "Pour quel utilisateur / persona ?": "Les chefs de projet et les développeurs.",
                "Quel bénéfice principal ?": "Améliore la productivité et la clarté du projet.",
                "Quels KPIs ou critères de succès ?": "Réduction de 30% du temps de planification.",
                "Quelles contraintes / limites à respecter ?": "Budget limité à 50k€."
            }
        }
        
        # Update the vision
        response = requests.put(f"{PROJECTS_URL}/{project_id}/vision/", json=vision_update_data, headers=headers)
        print(f"Update Vision Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("Vision updated successfully!")
            updated_vision = response.json()
            print(f"Updated Vision Data: {updated_vision}")
            return updated_vision
        else:
            print(f"Vision update failed: {response.text}")
            return None
    else:
        print(f"Failed to get vision: {response.text}")
        return None

def test_project_description(auth_token, project_id):
    """Test Project Description functionality"""
    print(f"\nTesting Project Description for Project ID: {project_id}...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json'
    }
    
    # First, get the current description (should create it if doesn't exist)
    response = requests.get(f"{PROJECTS_URL}/{project_id}/desc/", headers=headers)
    print(f"Get Description Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Description retrieved successfully!")
        desc_data = response.json()
        print(f"Initial Description Data: {desc_data}")
        
        # Now update with sample details
        desc_update_data = {
            "details": {
                "Quelles fonctionnalités principales sont prévues ?": "Gestion des tâches, suivi des jalons, visualisation des flux.",
                "Quels utilisateurs interagiront avec le produit ?": "Chefs de projet, développeurs, QA.",
                "Quels scénarios clés ou flux métier ?": "Création de projets, définition des fonctionnalités, planification.",
                "Contraintes techniques, réglementaires ou business ?": "Doit être compatible avec les systèmes existants.",
                "Points critiques à surveiller ?": "Performance avec un grand nombre d'utilisateurs simultanés."
            }
        }
        
        # Update the description
        response = requests.put(f"{PROJECTS_URL}/{project_id}/desc/", json=desc_update_data, headers=headers)
        print(f"Update Description Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("Description updated successfully!")
            updated_desc = response.json()
            print(f"Updated Description Data: {updated_desc}")
            return updated_desc
        else:
            print(f"Description update failed: {response.text}")
            return None
    else:
        print(f"Failed to get description: {response.text}")
        return None

def test_feature_suggestions_list(auth_token, project_id):
    """Test listing feature suggestions for a project"""
    print(f"\nTesting List Feature Suggestions for Project ID: {project_id}...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}'
    }
    
    response = requests.get(f"{PROJECTS_URL}/{project_id}/features/", headers=headers)
    print(f"List Features Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Feature suggestions retrieved successfully!")
        response_data = response.json()
        print(f"Number of features: {len(response_data)}")
        if response_data:
            print(f"First feature: {response_data[0]}")
        return response_data
    else:
        print(f"Failed to get feature suggestions: {response.text}")
        return None

def test_create_feature_suggestion(auth_token, project_id):
    """Test creating a new feature suggestion"""
    print(f"\nTesting Create Feature Suggestion for Project ID: {project_id}...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json'
    }
    
    feature_data = {
        "title": "User Authentication System",
        "description": "Implement a secure user authentication system with login/logout functionality",
        "category": "Security",
        "source": "user"
    }
    
    response = requests.post(f"{PROJECTS_URL}/{project_id}/features/", json=feature_data, headers=headers)
    print(f"Create Feature Status Code: {response.status_code}")
    
    if response.status_code == 201:
        print("Feature suggestion created successfully!")
        response_data = response.json()
        print(f"Created feature: {response_data}")
        return response_data.get('id')
    else:
        print(f"Feature suggestion creation failed: {response.text}")
        return None

def test_create_ai_feature_suggestion(auth_token, project_id):
    """Test creating an AI-generated feature suggestion"""
    print(f"\nTesting Create AI Feature Suggestion for Project ID: {project_id}...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json'
    }
    
    feature_data = {
        "title": "AI-Powered Recommendations",
        "description": "Implement AI-powered feature recommendations based on user behavior",
        "category": "AI",
        "source": "ai"
    }
    
    response = requests.post(f"{PROJECTS_URL}/{project_id}/features/", json=feature_data, headers=headers)
    print(f"Create AI Feature Status Code: {response.status_code}")
    
    if response.status_code == 201:
        print("AI feature suggestion created successfully!")
        response_data = response.json()
        print(f"Created AI feature: {response_data}")
        return response_data.get('id')
    else:
        print(f"AI feature suggestion creation failed: {response.text}")
        return None

def test_get_single_feature_suggestion(auth_token, project_id, feature_id):
    """Test getting a single feature suggestion"""
    print(f"\nTesting Get Single Feature Suggestion (Project: {project_id}, Feature: {feature_id})...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}'
    }
    
    response = requests.get(f"{PROJECTS_URL}/{project_id}/features/{feature_id}/", headers=headers)
    print(f"Get Single Feature Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Single feature suggestion retrieved successfully!")
        response_data = response.json()
        print(f"Feature: {response_data}")
        return response_data
    else:
        print(f"Failed to get single feature: {response.text}")
        return None

def test_update_feature_suggestion(auth_token, project_id, feature_id):
    """Test updating a feature suggestion"""
    print(f"\nTesting Update Feature Suggestion (Project: {project_id}, Feature: {feature_id})...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json'
    }
    
    # Toggle the selected status
    update_data = {
        "selected": True,
        "title": "Updated Feature Title"
    }
    
    response = requests.put(f"{PROJECTS_URL}/{project_id}/features/{feature_id}/", json=update_data, headers=headers)
    print(f"Update Feature Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Feature suggestion updated successfully!")
        response_data = response.json()
        print(f"Updated feature: {response_data}")
        return response_data
    else:
        print(f"Feature suggestion update failed: {response.text}")
        return None

def test_delete_feature_suggestion(auth_token, project_id, feature_id):
    """Test deleting a feature suggestion"""
    print(f"\nTesting Delete Feature Suggestion (Project: {project_id}, Feature: {feature_id})...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}'
    }
    
    response = requests.delete(f"{PROJECTS_URL}/{project_id}/features/{feature_id}/", headers=headers)
    print(f"Delete Feature Status Code: {response.status_code}")
    
    if response.status_code == 204:
        print("Feature suggestion deleted successfully!")
        return True
    else:
        print(f"Feature suggestion deletion failed: {response.text}")
        return False

def main():
    """Run all feature tests"""
    print("Starting Features App Tests...\n")
    
    # Test login to get token
    auth_token = test_login()
    
    if not auth_token:
        print("Cannot proceed with tests - login failed.")
        return
    
    # Test creating a project for features
    project_id = test_create_project(auth_token)
    
    if project_id:
        print("\n" + "="*50)
        print("TESTING PRODUCT VISION & DESCRIPTION")
        print("="*50)
        
        # Test Product Vision
        vision_result = test_product_vision(auth_token, project_id)
        
        # Test Project Description
        desc_result = test_project_description(auth_token, project_id)
        
        print("\n" + "="*50)
        print("TESTING FEATURE SUGGESTIONS")
        print("="*50)
        
        # Test Feature Suggestions
        # Test listing features (should be empty initially)
        test_feature_suggestions_list(auth_token, project_id)
        
        # Test creating a feature suggestion
        feature_id = test_create_feature_suggestion(auth_token, project_id)
        
        if feature_id:
            # Test getting single feature
            test_get_single_feature_suggestion(auth_token, project_id, feature_id)
            
            # Test updating feature (selecting it)
            test_update_feature_suggestion(auth_token, project_id, feature_id)
            
            # Test creating an AI feature suggestion
            ai_feature_id = test_create_ai_feature_suggestion(auth_token, project_id)
            
            if ai_feature_id:
                # Test getting AI feature
                test_get_single_feature_suggestion(auth_token, project_id, ai_feature_id)
                
                # Test listing all features (should now have 2)
                test_feature_suggestions_list(auth_token, project_id)
                
                # Delete the AI feature
                test_delete_feature_suggestion(auth_token, project_id, ai_feature_id)
            
            # Delete the original feature
            test_delete_feature_suggestion(auth_token, project_id, feature_id)
    
    print("\nAll feature tests completed!")

if __name__ == "__main__":
    main()