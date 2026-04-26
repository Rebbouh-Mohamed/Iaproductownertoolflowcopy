import socket
from unittest.mock import patch
from rag.agent import fill_question, detailed_question, init_funcs, sugest_funcs

# Check for Ollama
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
result = sock.connect_ex(('localhost', 11434))
sock.close()

patcher = None
if result != 0:
    print("Ollama is NOT running. Using Mock LLM.")
    patcher = patch('rag.agent.OllamaLLM')
    MockLLM = patcher.start()
    mock_instance = MockLLM.return_value
    mock_instance.invoke.return_value = "Mocked LLM Response: This is a simulated answer."

# Questions from the first image (Strategic Questions)
strategic_questions = [
    "Quel problème ce produit résout-il ?",
    "Pour quel utilisateur / persona ?",
    "Quel bénéfice principal ?",
    "Quels KPIs ou critères de succès ?",
    "Quelles contraintes / limites à respecter ?"
]

# Questions from the second image (Project Details)
project_details_questions = [
    "Quelles fonctionnalités principales sont prévues ?",
    "Quels utilisateurs interagiront avec le produit ?",
    "Quels scénarios clés ou flux métier ?",
    "Contraintes techniques, réglementaires ou business ?",
    "Points critiques à surveiller ?"
]

product_vision_mock = "A revolutionary AI tool for product management."
product_description_mock = "This tool helps PMs generate features and answer strategic questions."
current_funcs_mock = "Login, Dashboard"




print("Testing fill_question with Strategic Questions:")
for q in strategic_questions:
    print(f"Question: {q}")
    try:
        # Note: The current implementation of fill_question returns an int, which might be a placeholder or error in the original code
        # assuming it returns a response string based on the prompt structure, but the code says int(response...)
        # I will just call it and print the result or error
        result = fill_question(q)
        print(f"Result: {result}")
    except Exception as e:
        print(f"Error: {e}")
    print("-" * 20)




print("\nTesting detailed_question with Project Details Questions:")
for q in project_details_questions:
    print(f"Question: {q}")
    try:
        # Note: detailed_question expects 'product_vision' in the prompt but the function signature doesn't take it as an argument.
        # It seems the function implementation in agent.py might be incomplete or relies on global context not fully set up.
        # However, I will call it as requested.
        result = detailed_question(q, product_vision_mock)
        print(f"Result: {result}")
    except Exception as e:
        print(f"Error: {e}")
    print("-" * 20)





# Testing init_funcs and sugest_funcs as well since they are in the file, although not explicitly mapped to the image questions directly
# They seem to be for generating functionalities based on vision/description.


print("\nTesting init_funcs (mocking context):")
try:
    # init_funcs uses {product_vision} and {product_description} in the prompt but doesn't take them as args.
    # It likely will fail or hallucinate if those placeholders aren't filled by the function internals (which they aren't in the provided snippet).
    # But I will call it to test execution.
    result = init_funcs(product_vision_mock, product_description_mock)
    print(f"Result: {result}")
except Exception as e:
    print(f"Error: {e}")





print("\nTesting sugest_funcs (mocking context):")
try:
    # sugest_funcs uses {product_vision}, {product_description}, {current_functionalities}
    result = sugest_funcs(product_vision_mock, product_description_mock, current_funcs_mock)
    print(f"Result: {result}")
except Exception as e:
    print(f"Error: {e}")

if patcher:
    patcher.stop()
