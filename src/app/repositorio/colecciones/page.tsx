'use client'

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

export default async function Collections() {
    const request = await get('/collections');
    const collections: Collection[] = Array.isArray(request.response.data) ? request.response.data : [];

    return (
        <Container id={'colecciones'}
                   crumb={[<Link key={'rep'} href={'/repositorio'}>Repositorio</Link>,
                       <Link key={'Colecciones'} href={'#colecciones'}>Colecciones</Link>]}>
            <h1 className={styles['title']}>Colecciones del repositorio</h1>
            <CollectionTree collections={collections}/>
        </Container>
    )
}