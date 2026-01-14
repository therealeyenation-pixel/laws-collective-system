
# LuvOnPurpose – Offline Companion System Handler
# Based on Scroll 20 – Platform Swap Protocol
# Version 1.0 | Custodian: Eternal Flame Vault | File: OfflineCompanionSystem.py

import os
import datetime

class OfflineCompanionSystem:
    def __init__(self, house_id, local_path="/local_backup/", sync_key=None):
        self.house_id = house_id
        self.local_path = local_path
        self.sync_key = sync_key or f"{house_id}_SYNCKEY_{datetime.datetime.now().timestamp()}"
        self.backup_log = []

    def initialize_companion(self):
        if not os.path.exists(self.local_path):
            os.makedirs(self.local_path)
        return {
            "house_id": self.house_id,
            "status": "INITIALIZED",
            "local_path": self.local_path,
            "sync_key": self.sync_key
        }

    def save_document(self, filename, content):
        filepath = os.path.join(self.local_path, filename)
        with open(filepath, "w") as f:
            f.write(content)
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.backup_log.append((filename, timestamp))
        return {
            "file": filename,
            "saved_at": timestamp,
            "status": "SAVED"
        }

    def retrieve_backup_log(self):
        return {
            "house_id": self.house_id,
            "backups": self.backup_log,
            "total_backups": len(self.backup_log)
        }

# Example usage
if __name__ == "__main__":
    offline = OfflineCompanionSystem("HOUSE_010")
    print(offline.initialize_companion())
    print(offline.save_document("scroll_backup.txt", "This is sacred data."))
    print(offline.retrieve_backup_log())
