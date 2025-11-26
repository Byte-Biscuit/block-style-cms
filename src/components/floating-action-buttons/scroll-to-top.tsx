"use client";
import { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 300);
        onScroll();
        // passive: true 提示浏览器监听器不会调用 preventDefault，从而允许浏览器在滚动期间更高效地进行滚动和渲染，提升性能并避免 jank。
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleClick = () => {
        /*
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
        检查用户的系统/浏览器“减少动画”偏好是否被启用。
        如果用户在操作系统或浏览器设置中选择了“减少动画/减少运动”，这个表达式会返回 true（表示应避免动画效果以保护易感用户）。
        behavior: prefersReduced ? "auto" : "smooth"

        scrollTo 的 behavior 参数控制滚动方式：
        "smooth"：平滑滚动（有动画）。
        "auto"：瞬间跳转（无动画，默认行为）。
        这行代码的含义：当用户偏好“减少动画”时使用 "auto"（立即跳转），否则使用 "smooth"（平滑滚动）。这是对无障碍（accessibility）设置的尊重。
        */
        const prefersReduced =
            typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({
            top: 0,
            behavior: prefersReduced ? "auto" : "smooth",
        });
    };

    if (!visible) return null;

    return (
        <IconButton
            aria-label="Back to top"
            onClick={handleClick}
            sx={{
                bgcolor: "background.paper",
                color: "primary.main",
                border: 1,
                borderColor: "divider",
                "&:hover": {
                    bgcolor: "action.hover",
                    borderColor: "primary.main",
                },
                boxShadow: 3,
                width: 40,
                height: 40,
            }}
            title="Back to top"
        >
            <KeyboardArrowUpIcon fontSize="small" />
        </IconButton>
    );
}
