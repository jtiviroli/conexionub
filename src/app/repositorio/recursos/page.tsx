'use client'

import React, {useEffect, useState} from "react";
import Container from "@/components/container/Container";
import Link from "next/link";
import {get} from "@/utils/request";

import styles from '../page.module.css';
import ResourcesList from './resourcelist';
import {Resource} from "@/types/resources";
import {useSearchParams} from 'next/navigation'

export default function ResourcesPage() {
    const searchParams = useSearchParams()
    const authorParam = searchParams?.get('author') ?? ''
    const authorName = authorParam && String(authorParam).trim().length > 0 ? String(authorParam) : ''

    const pageSize = 10;
    const desc = true;

    const [resourcesRaw, setResourcesRaw] = useState<Resource[]>([])
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [lastResource, setLastResource] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const qs = `?pageSize=${pageSize}&desc=${desc}` + (authorName ? `&author=${encodeURIComponent(authorName)}` : '')
                const endpoint = `/resources${qs}`
                const request = await get(endpoint)
                if (!mounted) return
                const raw = request.response.data || {}
                const resourcesArr: Resource[] = Array.isArray(raw.resources) ? raw.resources as Resource[] : []
                const more: boolean = !!raw.hasMore
                const last: string | null = raw.lastResource ?? null

                setResourcesRaw(resourcesArr)
                setHasMore(more)
                setLastResource(last)
            } catch (e) {
                console.error('Error cargando recursos', e)
                if (!mounted) return
                setError('No se pudieron cargar recursos')
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [searchParams?.toString()])

    return (
        <Container id={'recursos'} crumb={[<Link key={'Repositorio'} href={'/repositorio'}>Repositorio</Link>,
            <Link key={'Recursos'} href={'/repositorio/recursos'}>Recursos</Link>,
            authorName ? <Link key={'author'} href={'#recursos'}>Recursos de {authorName}</Link> : null
        ]}>
            <h1 className={styles['title']}>{authorName ? `Recursos de ${authorName}` : 'Recursos'}</h1>

            {error && <p style={{color: 'var(--error, #b00020)'}}>{error}</p>}

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <ResourcesList
                    initialResources={resourcesRaw}
                    initialHasMore={hasMore}
                    initialLastResource={lastResource}
                    authorName={authorName}
                    pageSize={pageSize}
                    desc={desc}
                />
            )}
        </Container>
    )
}
