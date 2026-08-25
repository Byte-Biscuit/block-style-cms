import {
    BasicTextStyleButton,
    BlockTypeSelect,
    CreateLinkButton,
    FormattingToolbar,
    NestBlockButton,
    TableCellMergeButton,
    TextAlignButton,
    UnnestBlockButton,
} from "@blocknote/react";
import BackgroundColorButton from "@/block-note/toolbar/background-color-button";
import SmartToolbarChildren from "@/block-note/toolbar/smart-toolbar-children";
import TextColorButton from "@/block-note/toolbar/text-color-button";
import ToolbarSeparator from "@/block-note/toolbar/toolbar-separator";

const EnhancedFormattingToolbar = () => {
    // Normal editing mode: full toolbar with smart separator filtering
    return (
        <FormattingToolbar>
            <SmartToolbarChildren>
                <BlockTypeSelect key="blockTypeSelect" />
                <ToolbarSeparator key="sep-1" />
                <TableCellMergeButton key="tableCellMergeButton" />
                <ToolbarSeparator key="sep-merge" />
                <BasicTextStyleButton
                    basicTextStyle="bold"
                    key="boldStyleButton"
                />
                <BasicTextStyleButton
                    basicTextStyle="italic"
                    key="italicStyleButton"
                />
                <BasicTextStyleButton
                    basicTextStyle="underline"
                    key="underlineStyleButton"
                />
                <BasicTextStyleButton
                    basicTextStyle="strike"
                    key="strikeStyleButton"
                />
                <ToolbarSeparator key="sep-2" />
                <TextAlignButton
                    textAlignment="left"
                    key="textAlignLeftButton"
                />
                <TextAlignButton
                    textAlignment="center"
                    key="textAlignCenterButton"
                />
                <TextAlignButton
                    textAlignment="right"
                    key="textAlignRightButton"
                />
                <ToolbarSeparator key="sep-3" />
                <TextColorButton key="textColorButton" />
                <BackgroundColorButton key="backgroundColorButton" />
                <ToolbarSeparator key="sep-4" />
                <NestBlockButton key="nestBlockButton" />
                <UnnestBlockButton key="unnestBlockButton" />
                <ToolbarSeparator key="sep-5" />
                <CreateLinkButton key="createLinkButton" />
            </SmartToolbarChildren>
        </FormattingToolbar>
    );
};

EnhancedFormattingToolbar.displayName = "EnhancedFormattingToolbar";

export default EnhancedFormattingToolbar;
