import styled from "styled-components";
import { layoutStyles } from "./styles";
import { collectionStyles } from "./collections";
import { articleStyles } from "./articles";
import { darkStyles } from "./dark-theme";
import { entryButtonStyles } from "./entry-button";

export const SiteSurface = styled.div`
  display: contents;
  ${layoutStyles}
  ${collectionStyles}
 ${articleStyles}
 ${darkStyles}
 ${entryButtonStyles}
`;
