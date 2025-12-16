import {
  Box,
  IconButton,
  Menu,
  Icon,
  Text,
  useBreakpointValue,
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
import { PageControls, ZoomControls } from "..";

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
        <Menu.Root open={menuOpen} onOpenChange={(e) => setMenuOpen(e.open)}>
          <Menu.Trigger asChild>
            <IconButton
              aria-label="القائمة"
              size={buttonSize}
              variant="ghost"
              color="white"
            >
              <Icon>
                <FaEllipsisV size={iconSize} />
              </Icon>
            </IconButton>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content minWidth="200px">
              <Menu.Item value="1" onClick={() => exportProvider?.download()}>
                <Icon mr={2}>
                  <FaFileDownload />
                </Icon>
                <Text>تحميل PDF</Text>
              </Menu.Item>

              <Menu.Item value="2" onClick={handlePrint}>
                <Icon mr={2}>
                  <FaPrint />
                </Icon>
                <Text>طباعة</Text>
              </Menu.Item>

              <Separator />

              <Menu.Item
                value="3"
                onClick={() => rotateProvider?.rotateForward()}
              >
                <Icon mr={2}>
                  <FaUndo />
                </Icon>
                <Text>تدوير لليمين</Text>
              </Menu.Item>

              <Menu.Item
                value="4"
                onClick={() => rotateProvider?.rotateBackward()}
              >
                <Icon mr={2}>
                  <FaSync />
                </Icon>
                <Text>تدوير لليسار</Text>
              </Menu.Item>

              <Separator />

              <Menu.Item
                value="5"
                onClick={() => fullscreenProvider?.toggleFullscreen()}
              >
                {fullscreenState.isFullscreen ? (
                  <>
                    <Icon mr={2}>
                      <FaCompress />
                    </Icon>
                    <Text>إنهاء ملء الشاشة</Text>
                  </>
                ) : (
                  <>
                    <Icon mr={2}>
                      <FaExpand />
                    </Icon>
                    <Text>ملء الشاشة</Text>
                  </>
                )}
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>

        <IconButton
          aria-label="الصور المصغرة"
          size={buttonSize}
          variant="ghost"
          color={thumbnailsOpen ? "blue.200" : "white"}
          onClick={onToggleThumbnails}
          display={{ base: "none", md: "flex" }}
        >
          <Icon>
            <FaThList size={iconSize} />
          </Icon>
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
