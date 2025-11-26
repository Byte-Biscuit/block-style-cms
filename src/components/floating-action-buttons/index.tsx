"use client";
import ScrollToTop from "./scroll-to-top";
import SuggestionSubmit from "./suggestion-submit";

export default function FloatingActionButtons() {
    return (
        <>
            <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-2">
                <SuggestionSubmit />
                <ScrollToTop />
            </div>
        </>
    );
}
