[English](README.md) | [日本語](README.ja.md) | [Tiếng Việt](README.vi.md)

# JV-TAXI

このプロジェクトは主に2つの要素で構成されています: **Backend** (Node.js + Express + TypeScript) と **Frontend** (React + TypeScript + Vite)。

以下は、チームメンバーがソースコードをクローンし、ローカル環境でセットアップしてテスト実行するためのガイドです。

## 環境要件

- [Node.js](https://nodejs.org/) がインストールされていること (**推奨: LTS バージョン 18.x 以上**)。
  - *注意:* Node.js がインストールされていない場合、`npm` コマンドを実行できません。バージョンが古すぎる場合、インストール時に `Prisma` や `@tailwindcss/vite` などのライブラリでエラーが発生します。
- Git がインストールされていること。

---

## 1. バックエンドのセットアップ (Setup Backend)

1. ターミナルを開き、`backend` ディレクトリに移動します:
   ```bash
   cd backend
   ```
2. 依存関係のライブラリ（packages）をインストールします:
   ```bash
   npm install
   ```
3. 環境変数の設定とデータベース（Supabase）の接続:
   - `backend` ディレクトリ内の `.env.example` ファイルから `.env` ファイルを作成します。
   - 作成した `.env` ファイルを開き、`[YOUR-PASSWORD]` を実際のデータベースの接続パスワードに置き換えます。
   - Stripe の変数を設定します:
     ```env
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_PUBLISHABLE_KEY=pk_test_...
     ```
4. データベース接続のテスト:
   ```bash
   npx ts-node src/test-db.ts
   ```
   _ターミナルに「Kết nối database thành công!」（データベース接続に成功しました！）と表示されれば、正しく設定されています。_
5. 開発（dev）環境でサーバーを起動します:
   ```bash
   npm run dev
   ```
   _サーバーが起動します。デフォルトではポート5000で動作します（例: `http://localhost:5000`）。_

---

## 2. フロントエンドのセットアップ (Setup Frontend)

1. 新しいターミナルを開き（バックエンドのターミナルは起動したまま並行して実行します）、`frontend` ディレクトリに移動します:
   ```bash
   cd frontend
   ```
2. 依存関係のライブラリ（packages）をインストールします:
   ```bash
   npm install
   ```
3. フロントエンドアプリケーションを起動します:
   ```bash
   npm run dev
   ```

---

## 3. 決済機能のテスト手順 (Stripe Visa デモ)

本プロジェクトは、Stripe 決済ゲートウェイを通じた Visa カード決済（デモ用）を統合しています。この機能をテストするには、以下の手順に従ってください。

### ステップ 1: 乗車確認画面へのアクセス
1. 乗客 (Passenger) アカウントでログインします。
2. ドライバー検索プロセスを実行します: **目的地検索** -> **車種選択** -> **ドライバー選択**。
3. **乗車確認 (Booking Confirmation)** 画面（`/passenger/booking-confirmation`）に遷移します。

### ステップ 2: 決済情報の入力
1. **お支払い方法 (Payment Method)** セクションで、**カード (Card)** を選択します。
2. **乗車確認 (Confirm Booking)** をクリックします。
3. カード情報の入力ポップアップが表示されます。Stripe のデモ用カード情報を入力します:
   - **カード番号 (Card number):** `4242 4242 4242 4242`
   - **有効期限 (MM/YY):** 将来の任意の日付 (例: `12/30`).
   - **セキュリティコード (CVC):** 任意の3桁の数字 (例: `123`).
   - **郵便番号 (Zip Code):** 任意の5桁 of 数字 (例: `10000`).
4. **今すぐ支払う (Pay Now)** をクリックします。

### ステップ 3: 結果の確認
- 入力情報が正しい場合、取引コード (Payment ID) とともに「**決済完了 (Payment Successful)**」のポップアップが表示されます。
- **プロフィール (Profile)** ページに移動して、アカウントに連携された Visa カードのデモ表示を確認できます。

---

## 4. フロントエンドのルート構造 (Frontend Route Structure)

### ゲスト向けフロー (Guest - 未ログイン)

| パス (URL)                | コンポーネント (`src/pages/guest/`) | 説明                                  |
| :----------------------- | :----------------------------- | :------------------------------------ |
| `/`                      | `GuestHome.tsx`                | ゲスト向けのホームページ。             |
| `/guest/search-location` | `GuestSearchLocation.tsx`      | ゲスト向けの目的地検索・選択ページ。   |
| `/login`                 | `SignIn.tsx`                   | ログイン画面。                        |
| `/signup`                | `SignUpSelection.tsx`          | アカウント登録のロール選択画面。       |
| `/signup/passenger`      | `PassengerSignUp.tsx`          | 乗客アカウントの登録画面。             |
| `/signup/driver`         | `DriverSignUp.tsx`             | ドライバーアカウントの登録画面。       |

### 乗客向けフロー (Passenger - ログイン済)

| パス (URL)                        | コンポーネント (`src/pages/passenger/`) | 説明                                  |
| :-------------------------------- | :--------------------------------- | :------------------------------------ |
| `/passenger`                      | `PassengerHome.tsx`                | 乗客向けのホームページ。               |
| `/passenger/search-location`      | `SearchLocation.tsx`               | 乗車のための目的地検索・選択ページ。   |
| `/passenger/booking-options`      | `BookingOptions.tsx`               | 乗車・マッチングオプション選択ページ。 |
| `/passenger/select-driver`        | `SelectDriver.tsx`                 | オンラインのドライバー一覧ページ。     |
| `/passenger/driver-detail`        | `DriverDetail.tsx`                 | ドライバーの詳細情報表示ページ。       |
| `/passenger/booking-confirmation` | `BookingConfirmationWrapper.tsx`   | 乗車確認＆Stripe決済ページ。           |
| `/passenger/profile`              | `Profile.tsx`                      | プロフィール情報＆Visaカード情報ページ。 |

---

## 5. 重要な注意事項

1. **Prisma 7 & Supabase**:
   - **必須**: `npm install` の実行直後に、`backend` ディレクトリで `npx prisma generate` を実行してください。この手順を行わないと、コードがモデル（Profile, Rideなど）を認識できず、TypeScript エラーやサーバー実行時のランタイムエラーの原因となります。
   - `schema.prisma` ファイルを変更するたびに、再度 `npx prisma generate` を実行してください。
   - `npm run db:seed` を使用して、サンプルデータ（デモアカウント、ドライバーリスト）を初期化できます。
2. **ポート競合 (Port Conflict)**:
   - デフォルト設定: バックエンドはポート **5000**、フロントエンドはポート **5173** を使用します。
   - すでに他のアプリケーションがこれらのポートを使用している場合、サーバーの起動に失敗するか、自動的に別のポートが割り当てられます。
   - *注意:* バックエンドのポートが変更された場合、接続エラーを避けるためにフロントエンドのコード側で API の呼び出し先 URL を更新する必要があります。
3. **セキュリティ**: 本番のシークレットキーを含む `.env` ファイルを決して Git にプッシュしないでください。現在提供されているファイルはデモ目的のため、Stripe のテスト用キー（Test Key）を使用しています。

---

## Git & ファイル除外設定 (.gitignore)

- `node_modules/` およびビルドディレクトリ（`dist/`, `build/`）は、すべて `.gitignore` で除外されるよう設定されています。
- `.env` などの機密性の高い環境変数ファイルもすべて無視（ignore）されます。
