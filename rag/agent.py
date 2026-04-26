import pandas as pd 
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM


OLLAMA_MODEL = "qwen3:8b"
SYSTEM_PROMPT = """ You are a Product Manager AI agent designed to assist with Product Design tasks.
you are expected to help sugesst and improve product features based on user context and requirements."""



GENERAL_CONTEXT = """Le projet consiste à développer un outil intelligent capable de transformer automatiquement un descriptif de projet, même rédigé de manière non structurée, en un ensemble de User Stories complètes, cohérentes et prêtes à être intégrées dans un backlog Agile.
L’objectif est d’aider les Product Owners, Business Analysts et équipes Produit à gagner du temps dans la rédaction fonctionnelle, tout en améliorant la qualité et l’homogénéité des spécifications."""  # to be retrived from another module  later 



#---------------------------------------------------------------------------------------------------
# Product Vision
#---------------------------------------------------------------------------------------------------



def fill_question(question , style= "concise"):

    user_promp = """We have this context about the product we want to design : {GENERAL_CONTEXT} .
    Based on this context, help answer the following question: {question} .
    keep the style of the answer {style}"""

    
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("user", user_promp)
    ])

    model = OllamaLLM(model=OLLAMA_MODEL)
    chain = prompt | model
    response = chain.invoke({
        "GENERAL_CONTEXT": GENERAL_CONTEXT,
        "question": question,
        "style": style
    })


    return response 





#---------------------------------------------------------------------------------------------------
# Product Description
#---------------------------------------------------------------------------------------------------



def detailed_question(question, product_vision, style= "concise"):

    user_promp = """We have this context about the product we want to design : {GENERAL_CONTEXT} . 
    The general product vision is : {product_vision} .
    Based on this context, sugest answer for this question: {question} .
    keep the style of the answer {style}"""

    
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("user", user_promp)
    ])

    model = OllamaLLM(model=OLLAMA_MODEL)
    chain = prompt | model
    response = chain.invoke({
        "GENERAL_CONTEXT": GENERAL_CONTEXT,
        "product_vision": product_vision,
        "question": question,
        "style": style
    })


    return response 




#---------------------------------------------------------------------------------------------------
# Functionalities
#---------------------------------------------------------------------------------------------------



def init_funcs(product_vision, product_description, style= "descriptive"):
    
    user_promp = """We are building a software product that we want to sugest inital functionalities. 
    The general product vision is : {product_vision} .
    The detailed product description is : {product_description} .
    
    want you to sugest list of functionalities that would help fullfil the product vision and description in this style :
    
    functionality1_name : description /
    functionality2_name : description /
    ...
    """

    
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("user", user_promp)
    ])

    model = OllamaLLM(model=OLLAMA_MODEL)
    chain = prompt | model
    response = chain.invoke({
        "product_vision": product_vision,
        "product_description": product_description
    })


    return response 



def sugest_funcs(product_vision, product_description, current_functionalities, style= "descriptive"):
    
    user_promp = """We are building a software product that we want to sugest additional functionalities. 
    The general product vision is : {product_vision} .
    The detailed product description is : {product_description} .
    The current list of functionalities is : {current_functionalities} .
    
    want you to sugest list of additional functionalities that would help fullfil the product vision and description in this style :
    
    functionality1_name : description /
    functionality2_name : description /
    ...
    """

    
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("user", user_promp)
    ])

    model = OllamaLLM(model=OLLAMA_MODEL)
    chain = prompt | model
    response = chain.invoke({
        "product_vision": product_vision,
        "product_description": product_description,
        "current_functionalities": current_functionalities
    })


    return response












# TODO Mohamed : whenever detail added and saved by user, we need way to retirive the latest details saved and add them
# into context