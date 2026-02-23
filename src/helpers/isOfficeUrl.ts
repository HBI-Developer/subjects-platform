const officeTypes: Array<[RegExp, string]> = [
  [/\.(doc|docx)($|\?)/, "word"],
  [/\.(ppt|pptx)($|\?)/, "powerpoint"],
  [/\.(xls|xlsx)($|\?)/, "excel"],
];

export default async function isOfficeUrl(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    const urlLower = url.toLowerCase();

    const officeMimeTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    const type = officeTypes.find((t) => t[0].test(urlLower));

    const hasOfficeMime = officeMimeTypes.some((type) =>
      contentType.includes(type),
    );

    if (type || hasOfficeMime) {
      if (type) {
        return type[1];
      } else if (hasOfficeMime) {
        switch (true) {
          case contentType.includes("msword") ||
            contentType.includes("wordprocessingml"): {
            return "word";
          }
          case contentType.includes("ms-excel") ||
            contentType.includes("spreadsheetml"): {
            return "powerpoint";
          }
          case contentType.includes("powerpoint") ||
            contentType.includes("presentationml"): {
            return "excel";
          }
        }
      }
    } else {
      return 415;
    }
  } catch (_) {
    // في حال فشل fetch بسبب CORS، نعتمد على التحقق من الامتداد كخيار بديل
    const urlLower = url.toLowerCase();

    const type = officeTypes.find((t) => t[0].test(urlLower));

    if (!type) {
      return 415;
    } else {
      return type[1];
    }
  }
}
