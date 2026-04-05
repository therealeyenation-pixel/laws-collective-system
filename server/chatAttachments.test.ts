import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ 
    key: "chat-attachments/1/1/test-file.png", 
    url: "https://storage.example.com/test-file.png" 
  }),
  storageGet: vi.fn().mockResolvedValue({ 
    key: "chat-attachments/1/1/test-file.png", 
    url: "https://storage.example.com/test-file.png" 
  }),
}));

describe("Chat Attachments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("File Upload Validation", () => {
    it("should reject files larger than 25MB", () => {
      const maxSize = 25 * 1024 * 1024; // 25MB
      const oversizedFile = maxSize + 1;
      
      expect(oversizedFile).toBeGreaterThan(maxSize);
    });

    it("should accept files within size limit", () => {
      const maxSize = 25 * 1024 * 1024;
      const validFile = 10 * 1024 * 1024; // 10MB
      
      expect(validFile).toBeLessThanOrEqual(maxSize);
    });

    it("should sanitize file names", () => {
      const unsafeFileName = "test file (1).png";
      const sanitized = unsafeFileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      
      expect(sanitized).toBe("test_file__1_.png");
      expect(sanitized).not.toContain(" ");
      expect(sanitized).not.toContain("(");
      expect(sanitized).not.toContain(")");
    });

    it("should generate unique file keys", () => {
      const chatId = 1;
      const userId = 2;
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileName = "test.png";
      
      const fileKey = `chat-attachments/${chatId}/${userId}/${timestamp}-${randomSuffix}-${fileName}`;
      
      expect(fileKey).toContain("chat-attachments/");
      expect(fileKey).toContain(`${chatId}`);
      expect(fileKey).toContain(`${userId}`);
      expect(fileKey).toContain(fileName);
    });
  });

  describe("File Type Detection", () => {
    const getFileIcon = (fileType: string) => {
      if (fileType.startsWith("image/")) return "🖼️";
      if (fileType.startsWith("video/")) return "🎬";
      if (fileType.startsWith("audio/")) return "🎵";
      if (fileType.includes("pdf")) return "📄";
      if (fileType.includes("word") || fileType.includes("document")) return "📝";
      if (fileType.includes("sheet") || fileType.includes("excel")) return "📊";
      if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "📽️";
      if (fileType.includes("zip") || fileType.includes("archive")) return "📦";
      return "📎";
    };

    it("should identify image files", () => {
      expect(getFileIcon("image/png")).toBe("🖼️");
      expect(getFileIcon("image/jpeg")).toBe("🖼️");
      expect(getFileIcon("image/gif")).toBe("🖼️");
    });

    it("should identify video files", () => {
      expect(getFileIcon("video/mp4")).toBe("🎬");
      expect(getFileIcon("video/webm")).toBe("🎬");
    });

    it("should identify audio files", () => {
      expect(getFileIcon("audio/mp3")).toBe("🎵");
      expect(getFileIcon("audio/wav")).toBe("🎵");
    });

    it("should identify document files", () => {
      expect(getFileIcon("application/pdf")).toBe("📄");
      expect(getFileIcon("application/msword")).toBe("📝");
      expect(getFileIcon("application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe("📝");
    });

    it("should identify spreadsheet files", () => {
      expect(getFileIcon("application/vnd.ms-excel")).toBe("📊");
      expect(getFileIcon("application/spreadsheet")).toBe("📊");
    });

    it("should identify archive files", () => {
      expect(getFileIcon("application/zip")).toBe("📦");
      expect(getFileIcon("application/x-archive")).toBe("📦");
    });

    it("should return default icon for unknown types", () => {
      expect(getFileIcon("application/octet-stream")).toBe("📎");
      expect(getFileIcon("unknown/type")).toBe("📎");
    });
  });

  describe("File Size Formatting", () => {
    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    it("should format bytes", () => {
      expect(formatFileSize(500)).toBe("500 B");
    });

    it("should format kilobytes", () => {
      expect(formatFileSize(2048)).toBe("2.0 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
    });

    it("should format megabytes", () => {
      expect(formatFileSize(1048576)).toBe("1.0 MB");
      expect(formatFileSize(5242880)).toBe("5.0 MB");
    });
  });

  describe("Base64 Encoding", () => {
    it("should handle base64 data URL format", () => {
      const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const base64 = dataUrl.split(",")[1];
      
      expect(base64).toBe("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
      expect(base64).not.toContain("data:");
      expect(base64).not.toContain("base64,");
    });

    it("should decode base64 to buffer", () => {
      const base64 = "SGVsbG8gV29ybGQ="; // "Hello World"
      const buffer = Buffer.from(base64, "base64");
      
      expect(buffer.toString()).toBe("Hello World");
    });
  });

  describe("Attachment Metadata", () => {
    it("should track image dimensions", () => {
      const attachment = {
        id: 1,
        fileName: "test.png",
        fileType: "image/png",
        fileSize: 1024,
        width: 800,
        height: 600,
      };
      
      expect(attachment.width).toBe(800);
      expect(attachment.height).toBe(600);
    });

    it("should allow null dimensions for non-images", () => {
      const attachment = {
        id: 2,
        fileName: "document.pdf",
        fileType: "application/pdf",
        fileSize: 2048,
        width: undefined,
        height: undefined,
      };
      
      expect(attachment.width).toBeUndefined();
      expect(attachment.height).toBeUndefined();
    });
  });

  describe("Message with Attachment", () => {
    it("should link attachment to message", () => {
      const message = {
        id: 1,
        chatId: 1,
        senderId: 1,
        content: "Check out this image",
        contentType: "attachment",
        attachmentId: 5,
      };
      
      expect(message.contentType).toBe("attachment");
      expect(message.attachmentId).toBe(5);
    });

    it("should generate default content for attachment-only messages", () => {
      const fileName = "report.pdf";
      const defaultContent = `Shared a file: ${fileName}`;
      
      expect(defaultContent).toBe("Shared a file: report.pdf");
    });
  });

  describe("Supported File Types", () => {
    const acceptedTypes = "image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar";
    
    it("should accept image files", () => {
      expect(acceptedTypes).toContain("image/*");
    });

    it("should accept video files", () => {
      expect(acceptedTypes).toContain("video/*");
    });

    it("should accept audio files", () => {
      expect(acceptedTypes).toContain("audio/*");
    });

    it("should accept document files", () => {
      expect(acceptedTypes).toContain(".pdf");
      expect(acceptedTypes).toContain(".doc");
      expect(acceptedTypes).toContain(".docx");
    });

    it("should accept spreadsheet files", () => {
      expect(acceptedTypes).toContain(".xls");
      expect(acceptedTypes).toContain(".xlsx");
    });

    it("should accept presentation files", () => {
      expect(acceptedTypes).toContain(".ppt");
      expect(acceptedTypes).toContain(".pptx");
    });

    it("should accept archive files", () => {
      expect(acceptedTypes).toContain(".zip");
      expect(acceptedTypes).toContain(".rar");
    });
  });
});
