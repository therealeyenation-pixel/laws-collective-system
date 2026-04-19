
# LuvOnPurpose – House Activation Validator
# Based on Scroll 19 – Crown of Completion Logic
# Version 1.0 | Custodian: Eternal Flame Vault | File: HouseActivationValidator.py

class HouseActivationValidator:
    def __init__(self, house_id, scrolls_sealed, tokens_triggered, luvledger_status, gpt_ready):
        self.house_id = house_id
        self.scrolls_sealed = scrolls_sealed  # Boolean
        self.tokens_triggered = tokens_triggered  # List of token types
        self.luvledger_status = luvledger_status  # Boolean
        self.gpt_ready = gpt_ready  # Boolean
        self.crown_issued = False

    def validate_activation(self):
        required_tokens = ["MIRROR", "GIFT", "SPARK", "HOUSE"]
        all_tokens_met = all(token in self.tokens_triggered for token in required_tokens)

        if self.scrolls_sealed and all_tokens_met and self.luvledger_status and self.gpt_ready:
            self.crown_issued = True
            return {
                "house_id": self.house_id,
                "status": "ACTIVATED",
                "message": "Crown of Completion granted. All conditions satisfied.",
                "crown_token": {
                    "status": "ISSUED",
                    "chain_hash": f"{self.house_id}_CROWN_TOKEN_HASH"
                }
            }
        else:
            reasons = []
            if not self.scrolls_sealed: reasons.append("Unsealed scrolls")
            if not all_tokens_met: reasons.append("Incomplete token sequence")
            if not self.luvledger_status: reasons.append("LuvLedger not TRUE")
            if not self.gpt_ready: reasons.append("GPT readiness check failed")

            return {
                "house_id": self.house_id,
                "status": "DENIED",
                "message": "Activation denied due to unmet conditions.",
                "missing": reasons
            }

# Example usage
if __name__ == "__main__":
    validator = HouseActivationValidator(
        house_id="HOUSE_005",
        scrolls_sealed=True,
        tokens_triggered=["MIRROR", "GIFT", "SPARK", "HOUSE"],
        luvledger_status=True,
        gpt_ready=True
    )
    print(validator.validate_activation())
