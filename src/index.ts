import 'dotenv/config';
import app from './app';

import { port } from './configs';

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
