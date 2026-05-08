import random
import string
import os
import datetime
import math

# Color constants for better UI
RED, GREEN, YELLOW, CYAN, RESET = "\033[91m", "\033[92m", "\033[93m", "\033[96m", "\033[0m"
BOLD = "\033[1m"

# List of common weak passwords
WEAK_PASSWORDS = [
    "123456", "password", "123456789", "12345678", "qwerty", "111111", 
    "admin", "welcome", "letmein", "sunshine", "iloveyou", "password123"
]

def clear_screen():
    os.system("cls" if os.name == "nt" else "clear")

def get_strength(password):
    """Calculates password strength score and returns details."""
    score = 0
    feedback = []
    
    # Length check
    length = len(password)
    if length >= 12: score += 40
    elif length >= 8: score += 20
    else: feedback.append("Too short (aim for 12+ chars)")

    # Character variety checks
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in string.punctuation for c in password)

    if has_upper: score += 15
    else: feedback.append("Add uppercase letters")
    
    if has_lower: score += 10
    
    if has_digit: score += 15
    else: feedback.append("Add numbers")
    
    if has_special: score += 20
    else: feedback.append("Add symbols (!@#...)")

    # Common password check
    if password.lower() in WEAK_PASSWORDS:
        score = 10
        feedback.insert(0, "Warning: This is a very common password!")

    # Determine label
    if score < 40: label, color = "Weak", RED
    elif score < 70: label, color = "Medium", YELLOW
    else: label, color = "Strong", GREEN

    return score, label, color, feedback

def generate_password():
    print(f"\n{BOLD}--- Password Generator ---{RESET}")
    try:
        length = int(input("Enter length (8-32): "))
        if length < 8: length = 8
    except: length = 12

    chars = string.ascii_letters + string.digits + string.punctuation
    # Ensure at least one of each for better strength
    pwd = [
        random.choice(string.ascii_uppercase),
        random.choice(string.ascii_lowercase),
        random.choice(string.digits),
        random.choice(string.punctuation)
    ]
    pwd += [random.choice(chars) for _ in range(length - 4)]
    random.shuffle(pwd)
    
    final_pwd = "".join(pwd)
    print(f"\nGenerated Password: {GREEN}{final_pwd}{RESET}")
    return final_pwd

def analyze_password():
    print(f"\n{BOLD}--- Password Analyzer ---{RESET}")
    pwd = input("Enter password to test: ")
    if not pwd: return

    score, label, color, feedback = get_strength(pwd)
    
    print(f"\nResults for: {pwd[0]}****{pwd[-1] if len(pwd)>1 else '*'}")
    print(f"Strength: {color}{BOLD}{label} ({score}/100){RESET}")
    
    if feedback:
        print("\nSuggestions:")
        for f in feedback:
            print(f" - {f}")
    else:
        print(f"\n{GREEN}Great! This password looks solid.{RESET}")

def save_to_file(content):
    filename = "password_report.txt"
    with open(filename, "a") as f:
        f.write(f"\n--- {datetime.datetime.now()} ---\n")
        f.write(content + "\n")
    print(f"\nSaved to {filename}")

def main():
    while True:
        clear_screen()
        print(f"{CYAN}{BOLD}")
        print("========================================")
        print("       SECUREPASS ANALYZER v1.0         ")
        print("========================================")
        print(f"{RESET}")
        print(" 1. Generate Random Password")
        print(" 2. Analyze Password Strength")
        print(" 3. Exit")
        
        choice = input(f"\n{YELLOW}Choose an option: {RESET}").strip()
        
        if choice == '1':
            pwd = generate_password()
            if input("\nSave this password? (y/n): ").lower() == 'y':
                save_to_file(f"Generated Password: {pwd}")
            input("\nPress Enter to continue...")
        elif choice == '2':
            analyze_password()
            input("\nPress Enter to continue...")
        elif choice == '3':
            print("\nGoodbye!")
            break
        else:
            print("\nInvalid choice.")
            input("\nPress Enter to try again...")

if __name__ == "__main__":
    main()
