import ExportAction from "./actions/export-action";
import ImportAction from "./actions/import-action";

export const fileService = {
  import: ImportAction,
  export: ExportAction,
};
