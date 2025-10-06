import React from "react";
import type { TextContent, BasicTextStyle } from "../meta";
import { twColorMap, textStyleTwMap } from "../meta";

const FormattedText: React.FC<{ item: TextContent }> = ({ item }) => {
    if (!item) return null;
    const styles = item.styles ?? {};
    const textClasses: string[] = [];

    Object.entries(styles).forEach(([style, isActive]) => {
        if (style === "textColor") return;
        if (isActive && style in textStyleTwMap) {
            const twClass = textStyleTwMap[style as BasicTextStyle];
            if (twClass) textClasses.push(twClass);
        }
    });

    const textColor = styles.textColor;
    if (textColor && textColor !== "default" && twColorMap[textColor]) {
        textClasses.push(twColorMap[textColor].textClass);
    }
    const backgroundColor = styles.backgroundColor;
    if (
        backgroundColor &&
        backgroundColor !== "default" &&
        twColorMap[backgroundColor]
    ) {
        textClasses.push(twColorMap[backgroundColor].bgClass);
    }
    const classNames = textClasses.filter(Boolean).join(" ");
    if (classNames || classNames.length > 0) {
        return <span className={classNames}>{item.text}</span>;
    }
    return <>{item.text}</>;
};

export default FormattedText;
