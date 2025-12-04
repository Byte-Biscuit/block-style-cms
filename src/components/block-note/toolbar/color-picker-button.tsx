import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useBlockNoteEditor,useSelectedBlocks  } from "@blocknote/react";
import { BLOCKNOTE_COLORS } from "@/lib/style-classes"; 
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useBlockNoteTranslation} from "@/block-note/locales";

type ColorPickerProps = {
  icon: React.ReactNode;
  type: "textColor" | "backgroundColor";
};

export const ColorPickerButton = ({ icon, type}: ColorPickerProps) => {
  const editor = useBlockNoteEditor();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null); 
  const selectedBlocks = useSelectedBlocks(editor);
  const isVisible=useMemo(()=>{
    return !!selectedBlocks.find((block) => "textColor" in block.props || "backgroundColor" in block.props);
  },[selectedBlocks]);
  const { t } = useBlockNoteTranslation();
  const tooltipText = type === "textColor" ? t("formatting_toolbar.text_color", "Text Color") : t("formatting_toolbar.background_color", "Background Color");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    // Listen for scroll events; automatically close the menu on scroll for better UX
    const handleScroll = () => {
      if(isOpen) setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true); 

    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  if (!isVisible) {
      return null;
  }

  const handleToggle = (e: React.MouseEvent) => {
    // Key 1: prevent default behavior to avoid the editor losing focus (blur); otherwise formatting won't apply to the selection
    e.preventDefault(); 
    e.stopPropagation();

    if (!isOpen) {
      // Key 2: calculate position
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 5, // button bottom + 5px spacing
        left: rect.left,      // align with the button's left side
      });
    }
    setIsOpen(!isOpen);
  };

  const handleColorSelect = (colorValue: string) => {
    if (editor) {
      // Ensure focus returns to the editor
      editor.focus();
      if (type === "textColor") {
        editor.toggleStyles({ textColor: colorValue });
      } else {
        editor.toggleStyles({ backgroundColor: colorValue });
      }
    }
    setIsOpen(false);
  };

  const menuContent = (
    <div 
      ref={menuRef}
      className="fixed z-50 flex w-36 flex-col gap-1 rounded-md border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
      style={{
        top: `${menuPos.top}px`,
        left: `${menuPos.left}px`
      }}
      // Prevent clicks inside the menu from triggering editor blur
      onMouseDown={(e) => e.stopPropagation()} 
    >
      {BLOCKNOTE_COLORS.map((color) =>{
        const displayName = t(`color_picker.colors.${color.value}`, color.name)
        return  (
        <button
          key={color.value}
          onMouseDown={(e) => { e.preventDefault(); handleColorSelect(color.value); }}
          className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors"
        >
          <span
            className={`h-4 w-4 rounded border border-gray-200 dark:border-gray-600 ${
              type === "textColor" ? color.bgClass.replace("bg-", "bg-") : color.bgClass
            }`}
            style={type === "textColor" ? { backgroundColor: color.value === 'default' ? 'black' : undefined } : {}}
          >
             {type === 'textColor' && (
                <span className={`flex justify-center items-center text-[10px] font-bold ${color.value === 'default' ? 'text-white' : ''}`} style={{color: color.value !== 'default' ? 'inherit' : ''}}>
                    A
                </span>
             )}
          </span>
          
          <span className={`text-gray-700 dark:text-gray-200 ${type === 'textColor' ? color.textClass : ''}`}>
            {displayName}
          </span>
        </button>
      )})}
    </div>
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="flex h-8 items-center gap-0.5 rounded px-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onMouseDown={handleToggle} 
        title={tooltipText}
        type="button"
      >
        <span className="text-gray-600 dark:text-gray-300">
            {icon}
        </span>
        <KeyboardArrowDownIcon sx={{ fontSize: 14 }} className="text-gray-400" />
      </button>

      {/* Dropdown menu */}
      {isOpen && typeof document !== "undefined" && createPortal(menuContent, (document.fullscreenElement || document.body) as Element)}
    </div>
  );
};