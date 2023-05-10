import { GetStaticProps } from "next";
import Head from "next/head";
import styles from "../styles/home.module.scss";
import Image from "next/image";

import heroImg from "../../public/assets/hero.png";

import { getDocs, collection } from "firebase/firestore";
import { db } from "@/services/firebaseConnection";

interface HomeProps {
  posts: number;
  comments: number;
}

export default function Home({ posts, comments }: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma fácil</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="Logo Tarefas+"
            src={heroImg}
            priority
          />
        </div>
        <h1 className={styles.title}>
          Crie histórias com Inteligência Artificial! <br />
          Promoção de lançamento!! 50% de desconto
        </h1>

        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+ de {posts} Histórias Solicitadas</span>
          </section>
          <section className={styles.box}>
            <span>+ de {comments} Histórias respondidas pela IA</span>
          </section>
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  //Buscar os numeros no banco e madnar pro componente

  const commentRef = collection(db, "comments");
  const commentSnapshot = await getDocs(commentRef);

  const postRef = collection(db, "tarefas");
  const postSnapshot = await getDocs(postRef);

  return {
    props: {
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0,
    },
    revalidate: 60, //revalida em 60 segundos
  };
};
