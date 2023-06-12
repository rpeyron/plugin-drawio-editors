import { library, config } from '@fortawesome/fontawesome-svg-core';
import { faGithub, faSlack } from '@fortawesome/free-brands-svg-icons';
import { faGlobe, faBook } from '@fortawesome/free-solid-svg-icons';

config.autoAddCss = false;

library.add(faGithub, faSlack, faGlobe, faBook);

export default interface Icon {
  iconName: string;
  url: string;
  iconPrefix?: string;
}
