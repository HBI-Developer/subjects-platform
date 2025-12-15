import { createPluginRegistration } from "@embedpdf/core";
import { LoaderPluginPackage } from "@embedpdf/plugin-loader";
import { ViewportPluginPackage } from "@embedpdf/plugin-viewport";
import { ScrollPluginPackage, ScrollStrategy } from "@embedpdf/plugin-scroll";
import { ZoomPluginPackage, ZoomMode } from "@embedpdf/plugin-zoom";
import { RenderPluginPackage } from "@embedpdf/plugin-render";
import { TilingPluginPackage } from "@embedpdf/plugin-tiling";
import { RotatePluginPackage } from "@embedpdf/plugin-rotate";
import { FullscreenPluginPackage } from "@embedpdf/plugin-fullscreen";
import { ExportPluginPackage } from "@embedpdf/plugin-export";
import { ThumbnailPluginPackage } from "@embedpdf/plugin-thumbnail";

export const usePlugins = (documentUrl?: string) => {
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
};
