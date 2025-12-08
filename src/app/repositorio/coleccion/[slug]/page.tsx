'use client'

import React, {useEffect, useState} from 'react'
import Container from "@/components/container/Container";
import Link from "next/link";
import styles from './page.module.css'
import {get} from '@/utils/request'
import ResourcesList from './resourcelist'
import {Resource} from '@/types/resources'
import {useParams, useSearchParams} from 'next/navigation'

type CollectionNode = {
    _id: string
    name: string
    description?: string
    licence?: string
    children?: CollectionNode[]
}

export default function Collection() {
    const params = useParams() as { slug?: string }
    const searchParams = useSearchParams()
    const slug = params.slug ?? ''

    const [tree, setTree] = useState<CollectionNode | null>(null)
    const [resources, setResources] = useState<Resource[]>([])
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [lastResource, setLastResource] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    // derive pageSize and desc from search params
    const pageSizeParam = searchParams?.get('pageSize') ?? '5'
    const descParam = searchParams?.get('desc') ?? 'true'

    useEffect(() => {
        if (!slug) return
        let mounted = true
        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const pageSize = encodeURIComponent(pageSizeParam)
                const desc = encodeURIComponent(descParam)
                const qs = `?pageSize=${pageSize}&desc=${desc}`

                const res = await get(`/collection/${slug}${qs}`)
                if (!mounted) return
                const data = res.response.data || {}

                setTree(data.tree ?? null)
                setResources(data.resources ?? [])
                setHasMore(!!data.hasMore)
                setLastResource(data.lastResource ?? null)
            } catch (e) {
                console.error('Error cargando colección', e)
                if (!mounted) return
                setError('No se pudo cargar la colección')
            } finally {
                if (!mounted) return
                setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
        // depend on slug and serialized search params to refetch when changed
    }, [slug, searchParams?.toString()])

    function renderChildren(node?: CollectionNode | null) {
        if (!node || !node.children || node.children.length === 0) return null
        return (
            <>
                <h2>Sub colecciones</h2>
                <ul className={styles['collections']}>
                    {node.children.map(child => (
                        <li key={child._id}>
                            <Link href={`/repositorio/coleccion/${child._id}`}
                                  className={styles['collection']}>{child.name}</Link>
                        </li>
                    ))}
                </ul>
            </>
        )
    }

    return (
        <>

            <Container id={"subcollections"}
                       crumb={[<Link key={'repositorio'} href={"/repositorio"}>Repositorio</Link>,
                           <Link key={'cols'} href={'/repositorio/colecciones'}>Colecciones</Link>,
                           <Link key={'col'} href={'#col'}>{tree?.name ?? 'Colección'}</Link>]}
            >

                <div className={styles['filtersBox']}>
                    <form method="get" className={styles['filters']}>
                        <div className={styles['field']}>
                            <label className={styles['label']}>Tamaño</label>
                            <select name="pageSize" defaultValue={pageSizeParam} className={styles['select']}>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>

                        <div className={styles['field']}>
                            <label className={styles['label']}>Orden</label>
                            <select name="desc" defaultValue={descParam} className={styles['select']}>
                                <option value="true">Descendente</option>
                                <option value="false">Ascendente</option>
                            </select>
                        </div>

                        <div className={styles['fieldButton']}>
                            <button type="submit" className={styles['applyBtn']}>Aplicar</button>
                        </div>
                    </form>
                </div>

                <h1 className={styles['collection-box-title']}>{tree?.name ?? 'Colección'}</h1>
                {tree?.description && <p className={styles['collection-description']}>{tree.description}</p>}

                {renderChildren(tree)}

                <h2>Entradas recientes</h2>
                <ResourcesList
                    initialResources={resources}
                    initialHasMore={hasMore}
                    initialLastResource={lastResource}
                    slug={slug}
                    pageSize={Number(pageSizeParam)}
                    desc={descParam === 'true'}
                />

            </Container>
        </>
    )
}
