import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Input,
  Text,
  useBreakpointValue,
  Portal,
} from "@chakra-ui/react";
import {
  FaSearchPlus,
  FaSearchMinus,
  FaChevronDown,
  FaCompress,
  FaExpand,
} from "react-icons/fa";
import { useZoom } from "@embedpdf/plugin-zoom/react";
import { ZoomMode, type ZoomLevel } from "@embedpdf/plugin-zoom";
import { useState, useEffect } from "react";

const ZOOM_PRESETS = [
  { value: 0.5, label: "50%" },
  { value: 1, label: "100%" },
  { value: 1.5, label: "150%" },
  { value: 2, label: "200%" },
  { value: 4, label: "400%" },
];

const ZOOM_MODES = [
  { value: ZoomMode.FitPage, label: "ملء الصفحة", icon: FaCompress },
  { value: ZoomMode.FitWidth, label: "ملء العرض", icon: FaExpand },
];

const ZoomControls = () => {
  const { state, provides } = useZoom();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const zoomPercentage = Math.round(state.currentZoomLevel * 100);
    setInputValue(zoomPercentage.toString());
  }, [state.currentZoomLevel]);

  const handleZoomIn = () => provides?.zoomIn();
  const handleZoomOut = () => provides?.zoomOut();
  const handleZoomSelect = (value: ZoomLevel) => {
    provides?.requestZoom(value);
    setIsOpen(false);
  };

  const handleCustomZoom = (e: React.FormEvent) => {
    e.preventDefault();
    const newZoom = parseInt(inputValue, 10);
    if (!isNaN(newZoom) && newZoom > 0) {
      provides?.requestZoom(newZoom / 100);
    }
  };

  const buttonSize = isMobile ? "sm" : "md";
  const iconSize = isMobile ? 14 : 16;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      bg="whiteAlpha.200"
      borderRadius="md"
      px={2}
      py={1}
    >
      <form onSubmit={handleCustomZoom}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.replace(/[^0-9]/g, ""))}
          width={isMobile ? "45px" : "50px"}
          height={isMobile ? "28px" : "32px"}
          textAlign="center"
          fontSize={isMobile ? "xs" : "sm"}
          fontWeight="medium"
          border="none"
          bg="transparent"
          _focus={{ outline: "none" }}
        />
      </form>
      <Text
        fontSize={isMobile ? "xs" : "sm"}
        fontWeight="medium"
        color="white"
        mr={1}
      >
        %
      </Text>
      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton
            aria-label="خيارات التكبير"
            size={buttonSize}
            variant="ghost"
            color="white"
            onClick={() => setIsOpen(!isOpen)}
          >
            <FaChevronDown size={iconSize} />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content minWidth="180px">
              {ZOOM_PRESETS.map(({ value, label }) => (
                <Menu.Item
                  key={value}
                  onClick={() => handleZoomSelect(value)}
                  value={Math.abs(state.currentZoomLevel - value) < 0.01}
                >
                  <Text fontSize="sm">{label}</Text>
                </Menu.Item>
              ))}
              <Menu.Item value="new-file">New File...</Menu.Item>
              <Menu.Item value="new-win">New Window</Menu.Item>
              <Menu.Item value="open-file">Open File...</Menu.Item>
              <Menu.Item value="export">Export</Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>

      <Menu.Root open={isOpen} onExitComplete={() => setIsOpen(false)}>
        <Menu.List minWidth="180px">
          {ZOOM_PRESETS.map(({ value, label }) => (
            <MenuItem
              key={value}
              onClick={() => handleZoomSelect(value)}
              isActive={Math.abs(state.currentZoomLevel - value) < 0.01}
            >
              <Text fontSize="sm">{label}</Text>
            </MenuItem>
          ))}
          <Divider />
          {ZOOM_MODES.map(({ value, label, icon: Icon }) => (
            <MenuItem
              key={value}
              onClick={() => handleZoomSelect(value)}
              isActive={state.zoomLevel === value}
            >
              <Icon size={14} style={{ marginLeft: "8px" }} />
              <Text fontSize="sm" mr="auto">
                {label}
              </Text>
            </MenuItem>
          ))}
        </Menu.List>
      </Menu.Root>

      <IconButton
        aria-label="تصغير"
        icon={<FaSearchMinus size={iconSize} />}
        size={buttonSize}
        variant="ghost"
        color="white"
        onClick={handleZoomOut}
      />

      <IconButton
        aria-label="تكبير"
        icon={<FaSearchPlus size={iconSize} />}
        size={buttonSize}
        variant="ghost"
        color="white"
        onClick={handleZoomIn}
      />
    </Box>
  );
};

export default ZoomControls;
