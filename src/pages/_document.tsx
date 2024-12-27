/**
 * SSR で styled-components を使用するためのカスタムドキュメント
 * renderPage のカスタマイズは高度であり、サーバー側レンダリングをサポートするために CSS-in-JS などのライブラリにのみ必要です。
 * 組み込みの styled-jsx サポートには必要ありません。
 */

import Document, { DocumentContext, DocumentInitialProps } from "next/document";
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document {
  // 静的メソッドのgetInitialPropsをオーバーライド
  // `getInitialProps` フックは、`renderPage` を追加したコンテキスト オブジェクトを返します。
  // `renderPage` コールバックは、サーバー レンダリング ラッパーをサポートするために、`React` レンダリング ロジックを同期的に実行します。
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    // ServerStyleSheet はグローバルなスタイルを定義するための styled-components のユーティリティ
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      // Reactレンダリングロジックを同期的に実行する
      ctx.renderPage = () =>
        originalRenderPage({
          // enhanceApp は、App コンポーネントをラップするための関数
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      // 親の`getInitialProps`を実行すると、カスタムの`renderPage`が含まれる
      const initialProps = await Document.getInitialProps(ctx);

      return {
        ...initialProps,
        styles: [
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>,
        ],
      };
    } finally {
      sheet.seal();
    }
  }
}
