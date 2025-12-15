import { Box, useDisclosure } from "@chakra-ui/react";
import { usePdfiumEngine } from "@embedpdf/engines/react";
import { EmbedPDF } from "@embedpdf/core/react";
import { FullscreenProvider } from "@embedpdf/plugin-fullscreen/react";
import { FilePicker } from "@embedpdf/plugin-loader/react";
import { Viewport } from "@embedpdf/plugin-viewport/react";
import { Scroller } from "@embedpdf/plugin-scroll/react";
import { RenderLayer } from "@embedpdf/plugin-render/react";
import { TilingLayer } from "@embedpdf/plugin-tiling/react";
import { Rotate } from "@embedpdf/plugin-rotate/react";
import { Download } from "@embedpdf/plugin-export/react";

import { usePlugins } from "./hooks/usePlugins";
import { ThumbnailSidebar, Toolbar } from "./components";

interface PdfViewerProps {
  documentUrl?: string;
  height?: string | number;
}

export const PdfViewer = ({
  documentUrl,
  height = "100vh",
}: PdfViewerProps) => {
  const plugins = usePlugins(documentUrl);
  const { engine, isLoading, error } = usePdfiumEngine();
  const { open: thumbnailsOpen, onToggle: toggleThumbnails } = useDisclosure();

  if (error) {
    return (
      <Box
        height={height}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="red.50"
        color="red.700"
        p={4}
      >
        فشل تحميل عارض PDF: {error.message}
      </Box>
    );
  }

  if (isLoading || !engine) {
    return (
      <Box
        height={height}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
      >
        <Box
          width="48px"
          height="48px"
          border="4px solid"
          borderColor="blue.200"
          borderTopColor="blue.600"
          borderRadius="full"
          animation="spin"
          style={{ animationDuration: "1s" }}
        />
      </Box>
    );
  }

  return (
    <Box
      height={height}
      width="100%"
      overflow="hidden"
      position="relative"
      bg="gray.100"
      userSelect="none"
    >
      <EmbedPDF engine={engine} plugins={plugins}>
        {({ pluginsReady }) => (
          <FullscreenProvider>
            <Box
              display="flex"
              flexDirection="column"
              height="100%"
              width="100%"
            >
              <Toolbar
                onToggleThumbnails={toggleThumbnails}
                thumbnailsOpen={thumbnailsOpen}
              />

              <Box
                display="flex"
                flex={1}
                overflow="hidden"
                flexDirection={{ base: "column", md: "row" }}
              >
                {/* الشريط الجانبي للصور المصغرة */}
                <ThumbnailSidebar
                  isOpen={thumbnailsOpen && pluginsReady}
                  onClose={() => toggleThumbnails()}
                />

                {/* منطقة عرض PDF */}
                <Box flex={1} position="relative" overflow="hidden">
                  <Viewport
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#f1f3f5",
                      overflow: "auto",
                    }}
                  >
                    {pluginsReady ? (
                      <Scroller
                        renderPage={({
                          pageIndex,
                          scale,
                          width,
                          height,
                          document,
                        }) => (
                          <Rotate pageSize={{ width, height }}>
                            <Box
                              key={document?.id}
                              width={width}
                              height={height}
                              position="relative"
                              bg="white"
                              mx="auto"
                              my={2}
                              boxShadow="md"
                              borderRadius="sm"
                            >
                              <RenderLayer pageIndex={pageIndex} />
                              <TilingLayer
                                pageIndex={pageIndex}
                                scale={scale}
                              />
                            </Box>
                          </Rotate>
                        )}
                      />
                    ) : (
                      <Box
                        height="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Box
                          width="48px"
                          height="48px"
                          border="4px solid"
                          borderColor="blue.200"
                          borderTopColor="blue.600"
                          borderRadius="full"
                          animation="spin"
                          style={{ animationDuration: "1s" }}
                        />
                      </Box>
                    )}
                  </Viewport>
                </Box>
              </Box>

              {/* المكونات الخفية المطلوبة */}
              <Download />
              <FilePicker />
            </Box>
          </FullscreenProvider>
        )}
      </EmbedPDF>
    </Box>
  );
};
