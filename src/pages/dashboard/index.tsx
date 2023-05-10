import { GetServerSideProps } from "next";
import styles from "./styles.module.css";
import Head from "next/head";
import { ChangeEvent, useState, useEffect } from "react";

import { getSession } from "next-auth/react";
import { Textarea } from "../../components/textarea";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { db } from "@/services/firebaseConnection";
import {
  addDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import Link from "next/link";
import Stripe from "stripe";
import stripeConfig from "@/services/stripe";

interface dashboardProps {
  user: {
    products: any;
    email: string;
  };
}

interface TaskProps {
  id: string;
  created: Date;
  public: boolean;
  tarefa: string;
  user: string;
}
export default function Dashboard({ user }: dashboardProps) {
  const [input, setInput] = useState("");
  const [publicTask, setPublicTask] = useState(true);
  const [tasks, setTasks] = useState<TaskProps[]>([]);

  {
    /* CHQCKOUT INICIO */
  }

  {
    /** CHECKOUT FIM */
  }

  useEffect(() => {
    async function loadTarefas() {
      const tarefasRef = collection(db, "tarefas");
      let q;
      if (user?.email === "jailsonwin@gmail.com") {
        q = query(tarefasRef, orderBy("created", "desc"));
      } else {
        q = query(
          tarefasRef,
          orderBy("created", "desc"),
          where("user", "==", user?.email)
        );
      }
      onSnapshot(q, (snapshot) => {
        let lista = [] as TaskProps[];

        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            tarefa: doc.data().tarefa,
            created: doc.data().created,
            user: doc.data().user,
            public: doc.data().public,
          });
        });
        setTasks(lista);
      });
    }
    loadTarefas();
  }, [user?.email]);

  function handleChangePublic() {
    setPublicTask(!publicTask);
  }

  async function handleShare(id: string) {
    await navigator.clipboard.writeText(`
    ${process.env.NEXT_PUBLIC_URL}/task/${id}
    `);
    alert("URL Copiada com sucesso!");
  }

  async function handleDeleteTask(id: string) {
    const docRef = doc(db, "tarefas", id);
    await deleteDoc(docRef);
  }

  async function handleRegisterTask(event: HTMLFormElement) {
    event.preventDefault();
    if (input === "") return;
    await addDoc(collection(db, "tarefas"), {
      tarefa: input,
      created: new Date(),
      user: user?.email,
      public: publicTask,
    });
    setInput("");
    setPublicTask(false);
    try {
    } catch (erro) {
      console.log(erro);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Meu painel</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>Inicie sua história!</h1>

            <form onSubmit={handleRegisterTask}>
              <Textarea
                placeholder="Começe por exemplo com: 'Era uma vez uma menina chamada Maria, ela tinha 12 anos e adorava andar de bicicleta...' "
                value={input}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(event.target.value)
                }
              />

              {/**
               * 
               * Para deixar publica
               * 
 *               <div className={styles.checkboxArea}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label>Deixar história compartilhável?</label>
              </div>
 */}

              <button className={styles.button} type="submit">
                Gerar História
              </button>
            </form>
          </div>
        </section>

        <section className={styles.taskContainer}>
          <h1>Minhas Histórias</h1>
          {tasks.map((item) => (
            <article key={item.id} className={styles.task}>
              {item.public && (
                <div className={styles.tagContainer}>
                  <label className={styles.tag}>
                    <a href={`/task/${item.id}`}>História completa</a>{" "}
                  </label>
                  <button
                    className={styles.shareButton}
                    onClick={() => handleShare(item.id)}
                  >
                    <FiShare2 size={22} color="#3183ff" />
                  </button>
                  {/** Aqui vai a resposta da Historia */}

                  {/** fim da resposta da Historia */}
                </div>
              )}

              <div className={styles.taskContent}>
                {item.public ? (
                  <Link href={`/task/${item.id}`}>
                    <p>{item.tarefa}</p>
                  </Link>
                ) : (
                  <p>{item.tarefa}</p>
                )}
                <button
                  className={styles.trashButton}
                  onClick={() => handleDeleteTask(item.id)}
                >
                  <FaTrash size={24} color="#ea3140" />
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const stripe = new Stripe(stripeConfig.secretKey, {
    apiVersion: "2022-11-15",
  });

  const products = await stripe.products.list();
  console.log(products.data[0]);

  const session = await getSession({ req });

  // console.log(session);

  if (!session?.user) {
    // Se nao tem usuario vamos redirecionar para  /
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: {
        email: session?.user?.email,
        products: products.data,
      },
    },
  };
};
