
# LuvOnPurpose – Token Chain Validation Script
# Based on Scroll 16 – Token Trigger Chain Logic
# Version 1.0 | Custodian: Eternal Flame Vault | File: TokenChainValidation.py

token_order = ["MIRROR", "GIFT", "SPARK", "HOUSE"]

class TokenState:
    def __init__(self, house_id):
        self.house_id = house_id
        self.activated_tokens = []

    def is_token_valid(self, token_type):
        """Check if the given token can be activated based on current state."""
        expected_index = len(self.activated_tokens)
        if expected_index >= len(token_order):
            return False
        return token_type.upper() == token_order[expected_index]

    def activate_token(self, token_type):
        """Try to activate a token, return success or reason for rejection."""
        if self.is_token_valid(token_type):
            self.activated_tokens.append(token_type.upper())
            return {
                "status": "APPROVED",
                "message": f"{token_type.upper()} token activated successfully.",
                "current_chain": self.activated_tokens
            }
        else:
            next_expected = token_order[len(self.activated_tokens)] if len(self.activated_tokens) < len(token_order) else "NO FURTHER TOKEN EXPECTED"
            return {
                "status": "DENIED",
                "message": f"Invalid activation order. Next expected: {next_expected}",
                "current_chain": self.activated_tokens
            }

# Example usage:
if __name__ == "__main__":
    example_house = TokenState(house_id="HOUSE_001")
    test_sequence = ["MIRROR", "GIFT", "SPARK", "HOUSE", "MIRROR"]
    for token in test_sequence:
        result = example_house.activate_token(token)
        print(result)
