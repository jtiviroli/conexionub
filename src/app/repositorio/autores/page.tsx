'use client'

import Container from "@/components/container/Container";
import Link from "next/link";
import {get} from "@/utils/request";

import styles from './page.module.css';

interface ApiAuthorItem {
    author: string[] | string; // la API puede devolver un arreglo con el nombre
    amount?: number;
}

interface Author {
    name: string;
    amount?: number;
}

// Nuevo: tipo de la respuesta para evitar 'any'
interface ApiResponseShape {
    authors?: ApiAuthorItem[];
}

export default async function Authors() {
    // Petición a /authors con parámetros de query: lastAuthor y pageSize
    // Asumimos pageSize por defecto de 20 y sin cursor inicial
    const endpoint = `/authors`;
    const request = await get(endpoint);

    // La API devuelve un objeto { authors: [ { author: ["Nombre"], amount: 11 }, ... ] }
    const raw = request.response.data as ApiResponseShape | undefined;
    const items: ApiAuthorItem[] = raw && Array.isArray(raw.authors) ? raw.authors : [];

    const authors: Author[] = items.map((it, idx) => {
        const nameRaw = Array.isArray(it.author) ? (it.author[0] ?? '') : (it.author ?? '');
        const name = String(nameRaw) || `author-${idx}`;
        return {name, amount: it.amount};
    });

    return (
        <Container id={'autores'}
                   crumb={['Repositorio', <Link key={'Autores'} href={'#autores'}>Autores</Link>]}>
            <h1 className={styles['title']}>Autores del repositorio</h1>

            <div className={styles['list']}>
                {authors.map((author, i) => (
                    <Link href={`/repositorio/recursos?author=${encodeURIComponent(author.name)}`} key={`${author.name}-${i}`}
                          className={styles['author-card']}>
                        <h2 className={styles['author-name']}>
                            <span>{author.name}</span>
                        </h2>
                        {typeof author.amount !== 'undefined' && (
                            <p className={styles['author-bio']}>Recursos: {author.amount}</p>
                        )}
                    </Link>
                ))}
                {authors.length === 0 && <p className={styles['empty']}>No hay autores para mostrar.</p>}
            </div>
        </Container>
    )
}
