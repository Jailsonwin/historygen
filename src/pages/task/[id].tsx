import { async } from "@firebase/util";
import { ChangeEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import styles from "./styles.module.css";
import { db } from "@/services/firebaseConnection";
import {
  doc,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { Textarea } from "@/components/textarea";
import { FaTrash } from "react-icons/fa";

interface TaskProps {
  item: {
    tarefa: string;
    created: string;
    public: boolean;
    user: string;
    taskId: string;
  };
  allComments: commentProps[];
}

interface commentProps {
  id: string;
  comment: string;
  taskId: string;
  user: string;
  name: string;
}

export default function Task({ item, allComments }: TaskProps) {
  const { data: session } = useSession();

  const [input, setInput] = useState("");
  const [comments, setComments] = useState<commentProps[]>(allComments || []);

  async function handleComment(event: FormDataEvent) {
    event.preventDefault();

    if (input === "") return;
    if (!session?.user?.email || !session?.user?.name) return;

    try {
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        created: new Date(),
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId,
      });

      const data = {
        id: docRef.id,
        comment: input,
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId,
      };
      setComments((oldItens) => [...oldItens, data]);
      setInput("");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteComment(id: string) {
    try {
      const docRef = doc(db, "comments", id);
      await deleteDoc(docRef);

      const deletComment = comments.filter((item) => item.id !== id);

      setComments(deletComment);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Detalhes da Tarefa</title>
      </Head>
      <main className={styles.main}>
        <h1>Inicio da historia</h1>
        <article className={styles.task}>
          <p>{item.tarefa}</p>
        </article>
      </main>

      {/** PRECISA ADICIONAR A LISTADE ADMINS AQUI */}
      {session?.user?.email === "jailsonwin@gmail.com" && (
        <section className={styles.commentsContainer}>
          <h2>Completar Historia</h2>
          <form onSubmit={handleComment}>
            <Textarea
              placeholder="Digite aqui a historia completa"
              value={input}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setInput(event.target.value)
              }
            />
            <button disabled={!session?.user} className={styles.button}>
              Enviar
            </button>
          </form>
        </section>
      )}
      <section className={styles.commentsContainer}>
        <h2>História completa</h2>
        {comments.length === 0 && (
          <span>Sua história está sendo gerada, pode levar até 24h</span>
        )}

        {comments.map((item) => (
          <article key={item.id} className={styles.comment}>
            <div className={styles.headComment}>
              {item.user === session?.user?.email && (
                <label className={styles.commentsLabel}>{item.name}</label>
              )}
              {item.user === session?.user?.email && (
                <button
                  className={styles.buttonTrash}
                  onClick={() => handleDeleteComment(item.id)}
                >
                  <FaTrash size={18} color="#EA3140" />
                </button>
              )}
            </div>
            <p>{item.comment}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const docRef = doc(db, "tarefas", id);
  //query pra pegar os comentarios
  const q = query(collection(db, "comments"), where("taskId", "==", id));
  const snapShotComments = await getDocs(q);

  let allComments: commentProps[] = [];
  snapShotComments.forEach((doc) => {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      user: doc.data().user,
      name: doc.data().name,
      taskId: doc.data().taskId,
    });
    console.log(allComments);
  });
  const snapshot = await getDoc(docRef);

  if (snapshot.data() === undefined) {
    console.log("tarefa inexistente, redirecionando");
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  if (!snapshot.data()?.public) {
    console.log("tarefa privada, redirecionando");
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const miliseconds = snapshot.data()?.created?.seconds * 1000;
  const task = {
    tarefa: snapshot.data()?.tarefa,
    public: snapshot.data()?.public,
    created: new Date(miliseconds).toLocaleDateString(),
    user: snapshot.data()?.user,
    taskId: id,
  };

  return {
    props: {
      item: task,
      allComments: allComments,
    },
  };
};
