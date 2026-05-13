// Custom entry point: registers the Android widget task handler before
// expo-router boots the main app. The widget runs in a separate JS context
// when the OS asks it to redraw, so registration must happen at module-load
// time, not inside React tree.
import { registerWidget } from './services/widget/registry';

registerWidget();

import 'expo-router/entry';
