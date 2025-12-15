import {
  Box,
  IconButton,
  Menu,
  Icon,
  Text,
  useBreakpointValue,
  Portal,
  Separator,
} from "@chakra-ui/react";
import {
  FaEllipsisV,
  FaFileDownload,
  FaPrint,
  FaSync,
  FaUndo,
  FaExpand,
  FaCompress,
  FaThList,
} from "react-icons/fa";
import { useFullscreen } from "@embedpdf/plugin-fullscreen/react";
import { useExportCapability } from "@embedpdf/plugin-export/react";
import { useRotateCapability } from "@embedpdf/plugin-rotate/react";
import { useState } from "react";
import PageControls from "../PageControls";
import ZoomControls from "../ZoomControls";

interface PdfToolbarProps {
  onToggleThumbnails: () => void;
  thumbnailsOpen: boolean;
}

const Toolbar = ({ onToggleThumbnails, thumbnailsOpen }: PdfToolbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { provides: fullscreenProvider, state: fullscreenState } =
    useFullscreen();
  const { provides: exportProvider } = useExportCapability();
  const { provides: rotateProvider } = useRotateCapability();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const handlePrint = () => {
    window.print();
  };

  const buttonSize = isMobile ? "sm" : "md";
  const iconSize = isMobile ? 16 : 18;

  return (
    <Box
      as="nav"
      bg="blue.600"
      color="white"
      p={2}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={20}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton
              aria-label="القائمة"
              size={buttonSize}
              variant="ghost"
              color="white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <FaEllipsisV size={iconSize} />
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item
                  value="new-txt-a"
                  onClick={() => exportProvider?.download()}
                >
                  <Icon as={FaFileDownload} mr={2} />
                  <Text>تحميل PDF</Text>
                </Menu.Item>
                <Menu.Item value="new-file-a" onClick={handlePrint}>
                  <Icon as={FaPrint} mr={2} />
                  <Text>طباعة</Text>
                </Menu.Item>

                <Separator />

                <Menu.Item
                  value="new-win-a"
                  onClick={() => rotateProvider?.rotateForward()}
                >
                  <Icon as={FaUndo} mr={2} />
                  <Text>تدوير لليمين</Text>
                </Menu.Item>
                <Menu.Item
                  value="open-file-a"
                  onClick={() => rotateProvider?.rotateBackward()}
                >
                  <Icon as={FaSync} mr={2} />
                  <Text>تدوير لليسار</Text>
                </Menu.Item>

                <Separator />

                <Menu.Item
                  value="export-a"
                  onClick={() => fullscreenProvider?.toggleFullscreen()}
                >
                  {fullscreenState.isFullscreen ? (
                    <>
                      <Icon as={FaCompress} mr={2} />
                      <Text>إنهاء ملء الشاشة</Text>
                    </>
                  ) : (
                    <>
                      <Icon as={FaExpand} mr={2} />
                      <Text>ملء الشاشة</Text>
                    </>
                  )}
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>

        <IconButton
          aria-label="الصور المصغرة"
          size={buttonSize}
          variant="ghost"
          color={thumbnailsOpen ? "blue.200" : "white"}
          onClick={onToggleThumbnails}
          display={{ base: "none", md: "flex" }}
        >
          <FaThList size={iconSize} />
        </IconButton>
      </Box>

      <Box
        display="flex"
        alignItems="center"
        gap={2}
        flex={1}
        justifyContent="center"
      >
        <ZoomControls />
        <PageControls />
      </Box>

      <Box display={{ base: "none", md: "flex" }} alignItems="center">
        <Text fontSize="sm" fontWeight="medium">
          PDF Viewer
        </Text>
      </Box>
    </Box>
  );
};

export default Toolbar;
