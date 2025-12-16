import { Box, IconButton, Text } from "@chakra-ui/react";
import { FaChevronLeft } from "react-icons/fa";
import { ThumbnailsPane, ThumbImg } from "@embedpdf/plugin-thumbnail/react";
import { useScroll } from "@embedpdf/plugin-scroll/react";
import { useBreakpointValue } from "@chakra-ui/react";

interface ThumbnailSidebarProps {
  onClose: () => void;
}

export const ThumbnailSidebar = ({ onClose }: ThumbnailSidebarProps) => {
  const { currentPage, provides } = useScroll();
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      width={"100%"}
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
      {/* الرأس */}
      <Box
        flexShrink={0}
        p={3}
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
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

      {/* ThumbnailsPane - المكون الأساسي للتجهيز الافتراضي */}
      <ThumbnailsPane
        style={{
          flex: 1,
          width: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          rowGap: "20px",
        }}
      >
        {(meta) => (
          <Box
            key={meta.pageIndex} // ✅ مطلوب لأداء React
            style={{
              width: "100%",
              height: `auto`,
              // تنسيق إضافي
              padding: "8px 12px",
              cursor: "pointer",
              borderRadius: "6px",
              transition: "all 0.2s",
              border:
                currentPage === meta.pageIndex + 1
                  ? "2px solid #3182CE"
                  : "1px solid transparent",
              backgroundColor:
                currentPage === meta.pageIndex + 1 ? "#EBF8FF" : undefined,
            }}
            onClick={() =>
              provides?.scrollToPage({ pageNumber: meta.pageIndex + 1 })
            }
            _hover={{ bg: "gray.50" }}
          >
            {/* حاوية الصورة */}
            <Box
              mx="auto"
              style={{
                width: `${meta.width}px`,
                height: `${meta.height}px`,
                borderRadius: "4px",
                overflow: "hidden",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* 
                ✅ ThumbImg لا يأخذ pageIndex كـ prop
                ✅ يتم التعامل معه داخليًا بواسطة ThumbnailsPane
              */}
              <ThumbImg
                meta={meta}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>

            {/* التسمية */}
            <Text
              textAlign="center"
              fontSize="xs"
              mt={2}
              fontWeight={
                currentPage === meta.pageIndex + 1 ? "bold" : "normal"
              }
              color={currentPage === meta.pageIndex + 1 ? "#3182CE" : "#718096"}
            >
              الصفحة {meta.pageIndex + 1}
            </Text>
          </Box>
        )}
      </ThumbnailsPane>
    </Box>
  );
};

export default ThumbnailSidebar;
