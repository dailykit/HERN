export const formatWebRendererData = (data) => {
  let result = [];
  console.log("RUNNN Before", data);
  if (data.length) {
    console.log("RUNNN", data);
    data.forEach((obj) => {
      const websitePageModule = obj?.websitePage?.websitePageModules;
      const fetchedFile = websitePageModule?.map(({ file }) => {
        return file.path;
      });
      const fetchedLinkedCssFiles = websitePageModule
        ?.map((module) => {
          return module?.file?.linkedCssFiles?.map((file) => {
            return file?.cssFile?.path;
          });
        })
        ?.flat(1);
      const fetchedLinkedJsFiles = websitePageModule
        ?.map((module) => {
          return module?.file?.linkedJsFiles?.map((file) => {
            return file?.jsFile?.path;
          });
        })
        ?.flat(1);
      result.push({
        elementId: obj.id,
        filePath: fetchedFile,
        cssPath: fetchedLinkedCssFiles,
        jsPath: fetchedLinkedJsFiles,
      });
    });
    console.log("RESULT", result);
  }
  return result;
};
