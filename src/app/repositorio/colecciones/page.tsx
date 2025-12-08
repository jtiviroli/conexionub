'use client'

import React, {useEffect, useState} from 'react'
import Container from "@/components/container/Container";
import Link from "next/link";
import {get} from "@/utils/request";

import CollectionTree from "@/components/collection-tree/CollectionTree";

import styles from './page.module.css';

interface Collection {
    _id: string;
    name: string;
    description?: string;
    licence?: string;
    children: Collection[];
}

export default function Collections() {
    const [collections, setCollections] = useState<Collection[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const request = await get('/collections')
                if (!mounted) return
                const data: Collection[] = Array.isArray(request.response.data) ? request.response.data : []
                setCollections(data)
            } catch (e) {
                console.error('Error cargando colecciones', e)
                if (!mounted) return
                setError('No se pudieron cargar colecciones')
            } finally {
                if (!mounted) return
                setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    return (
        <Container id={'colecciones'}
                   crumb={[<Link key={'rep'} href={'/repositorio'}>Repositorio</Link>,
                       <Link key={'Colecciones'} href={'#colecciones'}>Colecciones</Link>]}>
            <h1 className={styles['title']}>Colecciones del repositorio</h1>

            {error && <p style={{color: 'var(--error, #b00020)'}}>{error}</p>}

            <CollectionTree collections={collections}/>
        </Container>
    )
}