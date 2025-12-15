import { Box, IconButton, Text, useBreakpointValue } from "@chakra-ui/react";
import { FaChevronLeft } from "react-icons/fa";
import { ThumbnailsPane, ThumbImg } from "@embedpdf/plugin-thumbnail/react";
import { useScroll } from "@embedpdf/plugin-scroll/react";

interface ThumbnailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThumbnailSidebar = ({ isOpen, onClose }: ThumbnailSidebarProps) => {
  const { state, provides } = useScroll();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const sidebarWidth = useBreakpointValue({ base: "200px", md: "250px" });

  if (!isOpen) return null;

  return (
    <Box
      width={sidebarWidth}
      height="100%"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      display="flex"
      flexDirection="column"
      position={isMobile ? "absolute" : "relative"}
      left={0}
      top={0}
      zIndex={isMobile ? 10 : 1}
      boxShadow={isMobile ? "lg" : "none"}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={3}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Text fontWeight="semibold" fontSize="sm">
          الصفحات
        </Text>
        <IconButton
          aria-label="إغلاق"
          size="sm"
          variant="ghost"
          display={{ md: "none" }}
          onClick={onClose}
        >
          <FaChevronLeft />
        </IconButton>
      </Box>

      <ThumbnailsPane>
        {(m) => {
          const isActive = state.currentPage === m.pageIndex + 1;
          return (
            <div
              key={m.pageIndex}
              style={{
                position: "absolute",
                top: m.top,
                height: m.wrapperHeight,
                // ... other wrapper styles
              }}
              onClick={() =>
                provides?.scrollToPage({ pageNumber: m.pageIndex + 1 })
              }
            >
              <div
                style={{
                  border: `2px solid ${isActive ? "blue" : "grey"}`,
                  width: m.width,
                  height: m.height,
                }}
              >
                <ThumbImg meta={m} />
              </div>
              <span style={{ height: m.labelHeight }}>{m.pageIndex + 1}</span>
            </div>
          );
        }}
      </ThumbnailsPane>
    </Box>
  );
};

export default ThumbnailSidebar;
