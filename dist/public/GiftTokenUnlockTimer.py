
# LuvOnPurpose – Gift Token Unlock Timer
# Based on Scroll 25 – Gifting System Logic
# Version 1.0 | Custodian: Eternal Flame Vault | File: GiftTokenUnlockTimer.py

from datetime import datetime, timedelta

class GiftToken:
    def __init__(self, recipient_id, issue_date=None, scrolls_completed=False):
        self.recipient_id = recipient_id
        self.issue_date = issue_date or datetime.utcnow()
        self.scrolls_completed = scrolls_completed
        self.status = "LOCKED"

    def check_unlock_status(self):
        """Determine if token can be activated based on time or task completion."""
        now = datetime.utcnow()
        one_year_anniversary = self.issue_date + timedelta(days=365)

        if self.scrolls_completed:
            self.status = "UNLOCKED"
            reason = "All House Stewardship Scrolls completed."
        elif now >= one_year_anniversary:
            self.status = "UNLOCKED"
            reason = "1-year anniversary reached."
        else:
            self.status = "LOCKED"
            reason = f"Not yet eligible. Days remaining: {(one_year_anniversary - now).days}"

        return {
            "recipient": self.recipient_id,
            "status": self.status,
            "reason": reason,
            "issue_date": self.issue_date.strftime("%Y-%m-%d"),
            "today": now.strftime("%Y-%m-%d")
        }

# Example usage
if __name__ == "__main__":
    # Example 1: Less than 1 year, not completed scrolls
    gift1 = GiftToken(recipient_id="HOUSE_002", issue_date=datetime.utcnow() - timedelta(days=300))
    print(gift1.check_unlock_status())

    # Example 2: Scrolls completed
    gift2 = GiftToken(recipient_id="HOUSE_003", issue_date=datetime.utcnow() - timedelta(days=200), scrolls_completed=True)
    print(gift2.check_unlock_status())

    # Example 3: Over 1 year
    gift3 = GiftToken(recipient_id="HOUSE_004", issue_date=datetime.utcnow() - timedelta(days=400))
    print(gift3.check_unlock_status())
