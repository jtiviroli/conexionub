'use client'

import React, {useEffect, useState} from 'react'
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

export default function Authors() {
    const [authors, setAuthors] = useState<Author[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const endpoint = `/authors`
                const request = await get(endpoint)
                if (!mounted) return
                const raw = request.response.data as ApiResponseShape | undefined
                const items: ApiAuthorItem[] = raw && Array.isArray(raw.authors) ? raw.authors : []
                const mapped = items.map((it, idx) => {
                    const nameRaw = Array.isArray(it.author) ? (it.author[0] ?? '') : (it.author ?? '')
                    const name = String(nameRaw) || `author-${idx}`
                    return {name, amount: it.amount}
                })
                setAuthors(mapped)
            } catch (e) {
                console.error('Error cargando autores', e)
                if (!mounted) return
                setError('No se pudieron cargar autores')
            } finally {
                if (!mounted) return
                setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    return (
        <Container id={'autores'}
                   crumb={['Repositorio', <Link key={'Autores'} href={'#autores'}>Autores</Link>]}>
            <h1 className={styles['title']}>Autores del repositorio</h1>

            {error && <p style={{color: 'var(--error, #b00020)'}}>{error}</p>}

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
