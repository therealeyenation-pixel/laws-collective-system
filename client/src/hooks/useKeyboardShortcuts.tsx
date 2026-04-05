import { useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const [, setLocation] = useLocation();

  const shortcuts: ShortcutConfig[] = [
    // Navigation shortcuts
    { key: "h", alt: true, action: () => setLocation("/"), description: "Go to Home" },
    { key: "d", alt: true, action: () => setLocation("/dashboard"), description: "Go to Dashboard" },
    { key: "t", alt: true, action: () => setLocation("/my-tasks"), description: "Go to My Tasks" },
    { key: "g", alt: true, action: () => setLocation("/grants"), description: "Go to Grants" },
    { key: "f", alt: true, action: () => setLocation("/finance-dashboard"), description: "Go to Finance" },
    { key: "c", alt: true, action: () => setLocation("/calendar"), description: "Go to Calendar" },
    { key: "s", alt: true, action: () => setLocation("/signature-requests"), description: "Go to Signatures" },
    { key: "e", alt: true, action: () => setLocation("/executive-dashboard"), description: "Go to Executive Dashboard" },
    { key: "p", alt: true, action: () => setLocation("/user-preferences"), description: "Go to Preferences" },
    { key: "m", alt: true, action: () => setLocation("/my-profile"), description: "Go to My Profile" },
    
    // Quick actions
    { key: "n", ctrl: true, shift: true, action: () => {
      toast.info("Quick create menu - Feature coming soon");
    }, description: "Quick Create Menu" },
    
    // Help
    { key: "/", ctrl: true, action: () => {
      showShortcutsHelp();
    }, description: "Show Keyboard Shortcuts" },
  ];

  const showShortcutsHelp = useCallback(() => {
    const shortcutsList = shortcuts
      .map(s => {
        const keys = [];
        if (s.ctrl) keys.push("Ctrl");
        if (s.alt) keys.push("Alt");
        if (s.shift) keys.push("Shift");
        keys.push(s.key.toUpperCase());
        return `${keys.join(" + ")}: ${s.description}`;
      })
      .join("\n");
    
    toast.info("Keyboard Shortcuts", {
      description: shortcutsList,
      duration: 10000,
    });
  }, [shortcuts]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);

  return { shortcuts, showShortcutsHelp };
}

// Component to display shortcuts help in a modal or panel
export function KeyboardShortcutsHelp() {
  const { shortcuts } = useKeyboardShortcuts();

  const formatShortcut = (s: ShortcutConfig) => {
    const keys = [];
    if (s.ctrl) keys.push("⌘/Ctrl");
    if (s.alt) keys.push("Alt");
    if (s.shift) keys.push("Shift");
    keys.push(s.key.toUpperCase());
    return keys.join(" + ");
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Keyboard Shortcuts</h3>
      <div className="grid gap-2">
        {shortcuts.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-1 border-b border-border/50">
            <span className="text-sm text-muted-foreground">{s.description}</span>
            <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">
              {formatShortcut(s)}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
