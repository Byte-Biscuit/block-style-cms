import BorderColorIcon from '@mui/icons-material/BorderColor'; 
import { ColorPickerButton } from './color-picker-button'; 

const BackgroundColorButton = () => (
  <ColorPickerButton 
    icon={<BorderColorIcon sx={{ fontSize: 18 }} />} 
    type="backgroundColor" 
  />
);

export default BackgroundColorButton;