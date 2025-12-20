import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  IconButton,
  Text,
  Spinner,
  Button,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  FaSearchPlus,
  FaSearchMinus,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaCompress,
  FaDownload,
  FaExternalLinkAlt,
  FaRedo,
  FaUndo,
  FaList,
} from "react-icons/fa";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { toaster } from "../ui/toaster";
import { Tooltip } from "../ui/tooltip";

// إعداد عامل PDF (Worker) - ضروري جداً لعمل المكتبة
// يفضل وضع هذا في ملف إعداد عام، لكنه هنا للشمولية
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// تعريف أنواع الأخطاء والم props
interface PDFError {
  type: "NETWORK" | "PARSE" | "LOAD";
  status?: number;
  message: string;
}

interface PDFViewerProps {
  src: string;
  onLoadSuccess?: () => void;
  onError?: (error: PDFError) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  src,
  onLoadSuccess,
  onError,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [pdfFile, setPdfFile] = useState<string | Blob | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);

  // لضبط عرض الصفحة ديناميكياً
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // 1. منطق جلب الملف والتحقق من أخطاء الشبكة
  useEffect(() => {
    const fetchPdf = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(src);

        if (!response.ok) {
          const errorData: PDFError = {
            type: "NETWORK",
            status: response.status,
            message: `HTTP Error: ${response.statusText}`,
          };
          if (onError) onError(errorData);
          toaster.create({
            title: "فشل تحميل الملف",
            description: `خطأ شبكة: ${response.status}`,
            type: "error",
            duration: 5000,
          });
          setIsLoading(false);
          return;
        }

        const blob = await response.blob();
        setPdfFile(blob);
      } catch (err: unknown) {
        const errorData: PDFError = {
          type: "NETWORK",
          status: 0, // 0 usually indicates network failure (cors, offline)
          message:
            (err as { message: string }).message || "Unknown network error",
        };
        if (onError) onError(errorData);
        setIsLoading(false);
      }
    };

    fetchPdf();
  }, [src, onError]);

  // 2. مراقبة حجم الشاشة للتجاوب (Responsive)
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // نترك هامشاً بسيطاً لتجنب التمرير الأفقي
        setContainerWidth(entry.contentRect.width - (isMobile ? 20 : 40));
      }
    });

    if (viewerContainerRef.current) {
      resizeObserver.observe(viewerContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [isMobile]);

  // 3. دوال التعامل مع الأحداث
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    if (onLoadSuccess) onLoadSuccess();
  };

  const onDocumentLoadError = (error: Error) => {
    setIsLoading(false);
    if (onError) {
      onError({ type: "PARSE", message: error.message });
    }
    toaster.create({
      title: "خطأ",
      description: "الملف تالف أو لا يمكن عرضه.",
      type: "error",
    });
  };

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) =>
      Math.min(Math.max(1, prevPageNumber + offset), numPages)
    );
  };

  const handleZoom = (delta: number) => {
    setScale((prevScale) => Math.min(Math.max(0.5, prevScale + delta), 3.0));
  };

  const handleRotate = (direction: "cw" | "ccw") => {
    setRotation((prev) => (direction === "cw" ? prev + 90 : prev - 90));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const downloadPdf = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    window.open(src, "_blank");
  };

  return (
    <Box
      ref={containerRef}
      h={isFullscreen ? "100vh" : "800px"} // ارتفاع ثابت أو كامل للشاشة
      w="100%"
      bg="gray.100"
      borderRadius={isFullscreen ? 0 : "md"}
      boxShadow="lg"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      position="relative"
    >
      {/* --- شريط الأدوات العلوي --- */}
      <Flex
        p={2}
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        align="center"
        justify="space-between"
        wrap="wrap"
        gap={2}
      >
        <Flex gap={2} align="center">
          <Tooltip content="قائمة الصفحات">
            <IconButton
              aria-label="Thumbnails"
              onClick={() => setShowThumbnails(!showThumbnails)}
              variant={showThumbnails ? "solid" : "ghost"}
              colorScheme="blue"
              size="sm"
            />
            <FaList />
          </Tooltip>
          <Text
            fontSize="sm"
            fontWeight="bold"
            display={{ base: "none", md: "block" }}
          >
            {pageNumber} / {numPages}
          </Text>
        </Flex>

        <Flex gap={1} align="center">
          <IconButton
            aria-label="Zoom Out"
            onClick={() => handleZoom(-0.1)}
            size="sm"
          >
            <FaSearchMinus />
          </IconButton>
          <Text fontSize="xs" w="40px" textAlign="center">
            {Math.round(scale * 100)}%
          </Text>
          <IconButton
            aria-label="Zoom In"
            onClick={() => handleZoom(0.1)}
            size="sm"
          >
            <FaSearchPlus />
          </IconButton>

          <Box w="1px" h="20px" bg="gray.300" mx={1} />

          <IconButton
            aria-label="Rotate CW"
            onClick={() => handleRotate("cw")}
            size="sm"
          >
            <FaRedo />
          </IconButton>
          <IconButton
            aria-label="Rotate CCW"
            onClick={() => handleRotate("ccw")}
            size="sm"
          >
            <FaUndo />
          </IconButton>
        </Flex>

        <Flex gap={1}>
          <IconButton aria-label="Download" onClick={downloadPdf} size="sm">
            <FaDownload />
          </IconButton>
          <IconButton
            aria-label="Open New Tab"
            onClick={openInNewTab}
            size="sm"
          >
            <FaExternalLinkAlt />
          </IconButton>
          <IconButton
            aria-label="Fullscreen"
            onClick={toggleFullscreen}
            size="sm"
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </IconButton>
        </Flex>
      </Flex>

      {/* --- منطقة العرض الرئيسية --- */}
      <Flex flex={1} overflow="hidden">
        {/* الشريط الجانبي (Thumbnails) */}
        {showThumbnails && numPages > 0 && (
          <Box
            w={{ base: "100px", md: "200px" }}
            bg="gray.50"
            borderRight="1px solid"
            borderColor="gray.200"
            overflowY="auto"
            p={2}
            css={{ "&::-webkit-scrollbar": { width: "4px" } }}
          >
            {/* ملاحظة: للملفات الكبيرة جداً يفضل استخدام react-window هنا */}
            {Array.from(new Array(numPages), (_, index) => (
              <Box
                key={`thumb_${index + 1}`}
                mb={3}
                cursor="pointer"
                opacity={pageNumber === index + 1 ? 1 : 0.6}
                border={pageNumber === index + 1 ? "2px solid" : "1px solid"}
                borderColor={pageNumber === index + 1 ? "blue.500" : "gray.300"}
                onClick={() => setPageNumber(index + 1)}
                _hover={{ opacity: 1 }}
              >
                {/* نعرض صفحة مصغرة بدون طبقة النصوص لتحسين الأداء */}
                {pdfFile && (
                  <Document file={pdfFile}>
                    <Page
                      pageNumber={index + 1}
                      width={isMobile ? 80 : 180}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                )}
                <Text fontSize="xs" textAlign="center" mt={1}>
                  {index + 1}
                </Text>
              </Box>
            ))}
          </Box>
        )}

        {/* عارض الصفحة الرئيسي */}
        <Box
          ref={viewerContainerRef}
          flex={1}
          bg="gray.100"
          overflow="auto"
          display="flex"
          justifyContent="center"
          alignItems="flex-start" // نبدأ من الأعلى
          p={4}
          position="relative"
        >
          {isLoading && (
            <Flex
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              justify="center"
              align="center"
              zIndex={10}
            >
              <Spinner
                size="xl"
                borderWidth="4px"
                animationDuration="0.65s"
                css={{ "--spinner-track-color": "colors.gray.200" }}
                color="blue.500"
              />
            </Flex>
          )}

          {pdfFile && (
            <Document
              file={pdfFile}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null} // نخفي الـ loading الافتراضي لأننا صممنا واحداً مخصصاً
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                // الحيلة هنا: عرض الصفحة يساوي عرض الحاوية
                width={containerWidth > 0 ? containerWidth : undefined}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
              />
            </Document>
          )}
        </Box>
      </Flex>

      {/* --- تذييل التنقل (عائم على الموبايل أو ثابت بالأسفل) --- */}
      <Flex
        p={2}
        bg="white"
        borderTop="1px solid"
        borderColor="gray.200"
        justify="center"
        align="center"
        gap={4}
      >
        <Button
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1}
          size="sm"
          colorScheme="blue"
          variant="outline"
        >
          السابق <FaChevronLeft />
        </Button>

        <Text fontWeight="bold">
          {pageNumber}{" "}
          <Text as="span" color="gray.500">
            من
          </Text>{" "}
          {numPages || "--"}
        </Text>

        <Button
          onClick={() => changePage(1)}
          disabled={pageNumber >= numPages}
          size="sm"
          colorScheme="blue"
          variant="outline"
        >
          <FaChevronRight />
          التالي
        </Button>
      </Flex>
    </Box>
  );
};

export default PDFViewer;
