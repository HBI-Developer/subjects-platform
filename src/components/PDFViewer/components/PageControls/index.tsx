import { Box, IconButton, Input, Text, Icon } from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useScroll } from "@embedpdf/plugin-scroll/react";
import { useEffect, useState } from "react";
import useScreenState from "@/hooks/useScreenState";

const PageControls = () => {
  const { currentPage, totalPages, scrollToPage } = useScroll();
  const [inputValue, setInputValue] = useState("");
  const { isMobile, isVertical } = useScreenState();

  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  if (isMobile && isVertical) return;

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      scrollToPage?.({ pageNumber: currentPage - 1 });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      scrollToPage?.({ pageNumber: currentPage + 1 });
    }
  };

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(inputValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      scrollToPage?.({ pageNumber: page });
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
      <IconButton
        aria-label="الصفحة السابقة"
        size={buttonSize}
        variant="ghost"
        color="white"
        onClick={handlePreviousPage}
        disabled={currentPage <= 1}
      >
        <Icon>
          <FaChevronRight size={iconSize} />
        </Icon>
      </IconButton>

      <form onSubmit={handlePageSubmit}>
        <Input
          name="page"
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
        mx={1}
      >
        من {totalPages}
      </Text>

      <IconButton
        aria-label="الصفحة التالية"
        size={buttonSize}
        variant="ghost"
        color="white"
        onClick={handleNextPage}
        disabled={currentPage >= totalPages}
      >
        <Icon>
          <FaChevronLeft size={iconSize} />
        </Icon>
      </IconButton>
    </Box>
  );
};

export default PageControls;
