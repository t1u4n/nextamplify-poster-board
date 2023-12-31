import { Amplify, API, withSSRContext } from "aws-amplify";
import Head from "next/head";
import { useRouter } from "next/router";
import awsExports from "@/aws-exports";
import { deletePost } from "@/graphql/mutations";
import { getPost } from "@/graphql/queries";
import styles from "../../styles/Home.module.css";

Amplify.configure({ ...awsExports, ssr: true });

export async function getServerSideProps({ req, params }) {
  const SSR = withSSRContext({ req });
  const { data } = await SSR.API.graphql({
    query: getPost,
    variables: {
      id: params.id,
    },
  });
  return {
    props: {
      post: data.getPost,
    },
  };
}

export default function Post({ post }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Loading&hellip;</h1>
      </div>
    );
  }

  async function handleDelete() {
    try {
      await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: deletePost,
        variables: {
          input: { id: post.id },
        },
      });

      window.location.href = "/";
    } catch ({ errors }) {
      console.error(...errors);
      throw new Error(errors[0].message);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{post.title} – My Blog with Amplify + Next.js</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{post.title}</h1>

        <p className={styles.description}>{post.content}</p>
      </main>

      <footer className={styles.footer}>
        <button className={styles.myButton} onClick={handleDelete}>
          💥 Delete post
        </button>
        <button className={styles.myButton} onClick={() => router.push("/")}>
          🏠 Home
        </button>
      </footer>
    </div>
  );
}
