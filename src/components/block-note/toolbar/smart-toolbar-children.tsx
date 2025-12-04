"use client";

import React, { useRef, useLayoutEffect, useCallback } from "react";

interface SmartToolbarChildrenProps {
    children: React.ReactNode;
}

/**
 * A wrapper component that intelligently filters toolbar separators.
 * It hides separators that are:
 * - At the beginning of the toolbar
 * - At the end of the toolbar
 * - Adjacent to another separator (consecutive separators)
 * - The only visible elements (all buttons hidden)
 * 
 * This works by checking the actual DOM after render, since button visibility
 * is determined internally by each button component based on block type.
 */
const SmartToolbarChildren: React.FC<SmartToolbarChildrenProps> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const filterSeparators = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        // Get all direct children that are actually rendered (not display:none by default)
        const allChildren = Array.from(container.children) as HTMLElement[];
        
        // First, reset all separators to visible
        allChildren.forEach((child) => {
            if (child.dataset.toolbarSeparator === "true") {
                child.style.display = "";
            }
        });

        // Get visible children (elements that have actual content/size)
        // Filter out elements that are already hidden or have no content
        const visibleChildren = allChildren.filter((child) => {
            // Check if element is visible (has dimensions or is a separator)
            const style = window.getComputedStyle(child);
            if (style.display === "none") return false;
            
            // For non-separator elements, check if they have actual content
            if (child.dataset.toolbarSeparator !== "true") {
                // Check if the element or its children have any rendered content
                return child.offsetWidth > 0 || child.offsetHeight > 0;
            }
            return true;
        });

        // Identify separators and non-separator (button) elements
        const isSeparator = (el: HTMLElement) => el.dataset.toolbarSeparator === "true";
        
        // Track which separators to hide
        const separatorsToHide: HTMLElement[] = [];

        // 1. Hide leading separators,[Sep1, Sep2, ButtonB, Sep3]
        for (const child of visibleChildren) {
            if (isSeparator(child)) {
                separatorsToHide.push(child);
            } else {
                break;
            }
        }

        // 2. Hide trailing separators[ButtonB, Sep3, Sep1, Sep2]
        for (let i = visibleChildren.length - 1; i >= 0; i--) {
            const child = visibleChildren[i];
            if (isSeparator(child)) {
                if (!separatorsToHide.includes(child)) {
                    separatorsToHide.push(child);
                }
            } else {
                break;
            }
        }

        // 3. Hide consecutive separators (keep only the first one)
        let prevWasSeparator = false;
        for (const child of visibleChildren) {
            if (isSeparator(child)) {
                if (prevWasSeparator && !separatorsToHide.includes(child)) {
                    separatorsToHide.push(child);
                }
                prevWasSeparator = true;
            } else {
                prevWasSeparator = false;
            }
        }

        // 4. Check if only separators remain
        const remainingButtons = visibleChildren.filter(
            (child) => !isSeparator(child) && !separatorsToHide.includes(child)
        );
        
        if (remainingButtons.length === 0) {
            // Hide all separators if no buttons are visible
            visibleChildren.forEach((child) => {
                if (isSeparator(child)) {
                    separatorsToHide.push(child);
                }
            });
        }

        // Apply hiding
        separatorsToHide.forEach((sep) => {
            sep.style.display = "none";
        });
    }, []);

    useLayoutEffect(() => {
        // Run filter after initial render
        filterSeparators();

        // Set up a MutationObserver to detect when children change visibility
        const container = containerRef.current;
        if (!container) return;

        const observer = new MutationObserver(() => {
            // Use requestAnimationFrame to batch updates
            requestAnimationFrame(filterSeparators);
        });

        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style", "class", "hidden"],
        });

        return () => observer.disconnect();
    }, [filterSeparators]);

    return (
        <div 
            ref={containerRef} 
            className="contents"
            style={{ display: "contents" }}
        >
            {children}
        </div>
    );
};

SmartToolbarChildren.displayName = "SmartToolbarChildren";

export default SmartToolbarChildren;
