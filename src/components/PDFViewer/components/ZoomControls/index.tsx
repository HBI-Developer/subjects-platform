import {
  Box,
  IconButton,
  Menu,
  Input,
  Text,
  useBreakpointValue,
  Icon,
  Separator,
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

      <Menu.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
        <Menu.Trigger asChild>
          <IconButton
            aria-label="خيارات التكبير"
            size={buttonSize}
            variant="ghost"
            color="white"
          >
            <Icon>
              <FaChevronDown size={iconSize} />
            </Icon>
          </IconButton>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content minWidth="180px">
            {ZOOM_PRESETS.map(({ value, label }) => (
              <Menu.Item
                key={value}
                value={value.toString()}
                onClick={() => handleZoomSelect(value)}
                closeOnSelect={false}
                backgroundColor={
                  Math.abs(state.currentZoomLevel - value) < 0.01
                    ? "blue.500"
                    : undefined
                }
              >
                <Text fontSize="sm">{label}</Text>
              </Menu.Item>
            ))}
            <Separator />
            {ZOOM_MODES.map(({ value, label, icon: IconComponent }) => (
              <Menu.Item
                key={value}
                value={value.toString()}
                onClick={() => handleZoomSelect(value)}
                closeOnSelect={false}
                backgroundColor={
                  state.zoomLevel === value ? "blue.500" : undefined
                }
              >
                <Icon mr={2}>
                  <IconComponent size={14} />
                </Icon>
                <Text fontSize="sm" mr="auto">
                  {label}
                </Text>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>

      <IconButton
        aria-label="تصغير"
        size={buttonSize}
        variant="ghost"
        color="white"
        onClick={handleZoomOut}
      >
        <Icon>
          <FaSearchMinus size={iconSize} />
        </Icon>
      </IconButton>

      <IconButton
        aria-label="تكبير"
        size={buttonSize}
        variant="ghost"
        color="white"
        onClick={handleZoomIn}
      >
        <Icon>
          <FaSearchPlus size={iconSize} />
        </Icon>
      </IconButton>
    </Box>
  );
};

export default ZoomControls;
