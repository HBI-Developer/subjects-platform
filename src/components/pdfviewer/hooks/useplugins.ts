import { createPluginRegistration } from "@embedpdf/core";
import { ExportPluginPackage } from "@embedpdf/plugin-export";
import { FullscreenPluginPackage } from "@embedpdf/plugin-fullscreen";
import { LoaderPluginPackage } from "@embedpdf/plugin-loader";
import { RenderPluginPackage } from "@embedpdf/plugin-render";
import { RotatePluginPackage } from "@embedpdf/plugin-rotate";
import { ScrollPluginPackage, ScrollStrategy } from "@embedpdf/plugin-scroll";
import { ThumbnailPluginPackage } from "@embedpdf/plugin-thumbnail";
import { TilingPluginPackage } from "@embedpdf/plugin-tiling";
import { ViewportPluginPackage } from "@embedpdf/plugin-viewport";
import { ZoomMode, ZoomPluginPackage } from "@embedpdf/plugin-zoom";
import { useMemo } from "react";

export const usePlugins = (documentUrl?: string) => {
  return useMemo(() => {
    const plugins = [
      createPluginRegistration(LoaderPluginPackage, {
        loadingOptions: {
          type: "url" as const,
          pdfFile: {
            id: "1",
            url: documentUrl || "https://snippet.embedpdf.com/ebook.pdf",
          },
          options: {
            mode: "full-fetch" as const,
          },
        },
      }),
      createPluginRegistration(ViewportPluginPackage, {
        viewportGap: 10,
      }),
      createPluginRegistration(ScrollPluginPackage, {
        strategy: ScrollStrategy.Vertical,
      }),
      createPluginRegistration(RenderPluginPackage),
      createPluginRegistration(TilingPluginPackage, {
        tileSize: 768,
        overlapPx: 2.5,
        extraRings: 0,
      }),
      createPluginRegistration(ZoomPluginPackage, {
        defaultZoomLevel: ZoomMode.FitPage,
      }),
      createPluginRegistration(RotatePluginPackage),
      createPluginRegistration(FullscreenPluginPackage),
      createPluginRegistration(ExportPluginPackage),
      createPluginRegistration(ThumbnailPluginPackage),
    ];

    return plugins;
  }, [documentUrl]);
};
