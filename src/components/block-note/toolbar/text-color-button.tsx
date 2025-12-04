import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import { ColorPickerButton } from './color-picker-button'; 

 const TextColorButton = () => (
  <ColorPickerButton 
    icon={<FormatColorTextIcon sx={{ fontSize: 20 }} />} 
    type="textColor" 
  />
);
export default TextColorButton;